import smtplib
from collections import defaultdict
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import threading

from fastapi import APIRouter, Depends, HTTPException, Request
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from sqlalchemy.orm import Session

from app.configs.config import get_configs
from app.configs.db_connect import get_db
from app.configs.seguranca import criar_token, token_atual, verificar_pw, pw_encript
from app.estruturas.auth import Login, Token, AlterarPassword
from app.logica import auth as servico

router = APIRouter(prefix="/auth", tags=["Auth"])
_cfg = get_configs()

# Rate limiting — máx 5 tentativas por IP em 5 min
_tentativas: dict = defaultdict(list)
_lock = threading.Lock()

def verificar_rl(ip: str):
    agora = datetime.utcnow()
    limite = agora - timedelta(seconds=300)
    with _lock:
        _tentativas[ip] = [t for t in _tentativas[ip] if t > limite]
        if len(_tentativas[ip]) >= 5:
            raise HTTPException(429, "Demasiadas tentativas. Aguarde alguns minutos.")

def registar_falha(ip: str):
    with _lock:
        _tentativas[ip].append(datetime.utcnow())

def _obter_ip(request: Request) -> str:
    fw = request.headers.get("X-Forwarded-For")
    if fw:
        return fw.split(",")[0].strip()
    return request.client.host if request.client else "desconhecido"

def _serializer():
    return URLSafeTimedSerializer(_cfg.APP_SECRET_KEY)

def _obter_utilizador(tipo: str, uid: int, db: Session):
    if tipo == "admin":
        from app.tabelas_bd.admin import Admin
        return db.query(Admin).filter(Admin.id == uid).first()
    elif tipo == "gestor":
        from app.tabelas_bd.gestor import Gestor
        return db.query(Gestor).filter(Gestor.id == uid).first()
    elif tipo == "condomino":
        from app.tabelas_bd.condomino import Condomino
        return db.query(Condomino).filter(Condomino.id == uid).first()
    elif tipo == "tecnico":
        from app.tabelas_bd.tecnico import Tecnico
        return db.query(Tecnico).filter(Tecnico.id == uid).first()
    return None


# ── Login ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
def login(dados: Login, request: Request, db: Session = Depends(get_db)):
    ip = _obter_ip(request)
    verificar_rl(ip)
    try:
        if dados.perfil:
            utilizador = servico.autenticar(db, dados.email, dados.pw, dados.perfil)
            tipo = dados.perfil
        else:
            utilizador, tipo = servico.autenticar_auto(db, dados.email, dados.pw)
    except HTTPException:
        registar_falha(ip)
        raise
    token = criar_token(utilizador.id, tipo)
    return Token(access_token=token, token_type="bearer", perfil_utilizador=tipo, id=utilizador.id)


# ── Conta ────────────────────────────────────────────────────────────────────

@router.get("/conta")
def me(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
    tipo = dados["tipo"]
    uid  = dados["id"]
    utilizador = _obter_utilizador(tipo, uid, db)
    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado")
    return {"id": utilizador.id, "nome": utilizador.nome, "email": utilizador.email, "tipo": tipo}


# ── Alterar password — envia email de confirmação ────────────────────────────

@router.put("/alterar-password")
def alterar_password(dados: AlterarPassword, token: dict = Depends(token_atual), db: Session = Depends(get_db)):
    """Valida a password atual e envia um link de confirmação por email."""
    tipo = token["tipo"]
    uid  = token["id"]

    utilizador = _obter_utilizador(tipo, uid, db)
    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado")

    if not verificar_pw(dados.pw_atual, utilizador.pw):
        raise HTTPException(400, "A password atual está incorreta.")

    # Gerar token assinado com a nova password já em hash (válido 1 h)
    pw_hash = pw_encript(dados.pw_nova)
    token_conf = _serializer().dumps(
        {"id": uid, "tipo": tipo, "pw": pw_hash},
        salt="confirmar-nova-pw"
    )

    link = f"{_cfg.APP_URL}/website_C/confirmar_pw.html?token={token_conf}"

    _enviar_email_confirmacao(utilizador.email, utilizador.nome, link)

    return {"mensagem": f"Enviámos um email de confirmação para {utilizador.email}. Clique no link para concluir a alteração."}


# ── Confirmar nova password — chamado ao clicar no link ──────────────────────

@router.post("/confirmar-nova-password")
def confirmar_nova_password(body: dict, db: Session = Depends(get_db)):
    """Recebe o token do link de confirmação e aplica a nova password."""
    token_conf = body.get("token", "")
    try:
        payload = _serializer().loads(
            token_conf, salt="confirmar-nova-pw", max_age=3600
        )
    except SignatureExpired:
        raise HTTPException(400, "O link expirou. Solicite uma nova alteração de password.")
    except BadSignature:
        raise HTTPException(400, "Link inválido.")

    uid  = payload["id"]
    tipo = payload["tipo"]
    pw   = payload["pw"]

    utilizador = _obter_utilizador(tipo, uid, db)
    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado.")

    utilizador.pw = pw
    db.commit()

    return {"mensagem": "Password alterada com sucesso! Já pode fazer login."}


# ── Email de confirmação ──────────────────────────────────────────────────────

def _enviar_email_confirmacao(email_destino: str, nome: str, link: str) -> None:
    corpo_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">
          Confirmar alteração de password
        </p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <p style="font-size:15px;color:#1A1A1A;margin:0 0 16px;">Olá, <strong>{nome}</strong>!</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 24px;">
          Recebemos um pedido para alterar a password da sua conta.<br>
          Clique no botão abaixo para confirmar a alteração.<br>
          <strong>O link expira em 60 minutos.</strong>
        </p>
        <a href="{link}"
           style="display:inline-block;background:#F08A24;color:#fff;padding:14px 28px;
                  font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;">
          Confirmar nova password
        </a>
        <p style="font-size:12px;color:#6B6860;margin:24px 0 0;">
          Se não foi você a solicitar esta alteração, ignore este email —
          a sua password permanece inalterada.
        </p>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">
          © 2026 Sistema de Gestão de Condomínios — Email gerado automaticamente.
        </p>
      </div>
    </div>
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Confirme a alteração da sua password — Gestão de Condomínios"
    msg["From"]    = f"{_cfg.SMTP_FROM_NAME} <{_cfg.SMTP_FROM_EMAIL}>"
    msg["To"]      = email_destino
    msg.attach(MIMEText(corpo_html, "html", "utf-8"))

    with smtplib.SMTP(_cfg.SMTP_HOST, _cfg.SMTP_PORT) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(_cfg.SMTP_USER, _cfg.SMTP_PASSWORD)
        smtp.sendmail(_cfg.SMTP_FROM_EMAIL, email_destino, msg.as_string())
