from collections import defaultdict
from datetime import datetime, timedelta, timezone
import threading

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from sqlalchemy.orm import Session

from app.configs.config import get_configs
from app.configs.db_connect import get_db
from app.configs.email import enviar_email
from app.configs.seguranca import criar_token, token_atual, verificar_pw, pw_encript
from app.estruturas.auth import Login, Token, AlterarPassword, RecuperarPassword, ResetPassword, ConfirmarNovaPassword
from app.logica import auth as servico
from app.tabelas_bd.admin import Admin
from app.tabelas_bd.gestor import Gestor
from app.tabelas_bd.condomino import Condomino
from app.tabelas_bd.tecnico import Tecnico

router = APIRouter(prefix="/auth", tags=["Auth"])
cfg = get_configs()

# (POST) /auth/login - Autenticação e geração de token
# (GET) /auth/conta - Obter dados da conta do utilizador autenticado
# (PUT) /auth/alterar-password - Iniciar alteração de password (envia email de confirmação)
# (POST) /auth/recuperar-password - Solicitar recuperação de password (envia email)
# (POST) /auth/confirmar-nova-password - Confirmar alteração de password via token
# (POST) /auth/reset-password - Redefinir password usando token de recuperação
_TABELAS = {
    "admin":     Admin,
    "gestor":    Gestor,
    "condomino": Condomino,
    "tecnico":   Tecnico,
}


# Rate limiting — máx 5 tentativas por IP em 5 min 

tentativas: dict = defaultdict(list)
lock = threading.Lock()


def verificar_rate_l(ip: str):
    agora = datetime.now(timezone.utc)
    limite = agora - timedelta(seconds=300)
    with lock:
        tentativas[ip] = [t for t in tentativas[ip] if t > limite]
        if len(tentativas[ip]) >= 5:
            raise HTTPException(429, "Demasiadas tentativas. Tente mais tarde.")


def registar_falha(ip: str):
    with lock:
        tentativas[ip].append(datetime.now(timezone.utc))


def obter_ip(request: Request) -> str:
    fw = request.headers.get("X-Forwarded-For")
    if fw:
        return fw.split(",")[0].strip()
    return request.client.host if request.client else "desconhecido"


def token_assign():
    return URLSafeTimedSerializer(cfg.APP_SECRET_KEY)


def obter_utilizador(tipo: str, uid: int, db: Session):
    modelo = _TABELAS.get(tipo)
    if not modelo:
        return None
    return db.query(modelo).filter(modelo.id == uid).first()



@router.post("/login", response_model=Token)
def login(dados: Login, request: Request, db: Session = Depends(get_db)):
    ip = obter_ip(request)
    verificar_rate_l(ip)
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


@router.get("/conta")
def dados_pessoais(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
    tipo = dados["tipo"]
    uid  = dados["id"]
    utilizador = obter_utilizador(tipo, uid, db)
    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado")

    resposta = {"id": utilizador.id, "nome": utilizador.nome, "email": utilizador.email, "tipo": tipo}
    if tipo == "gestor":
        resposta["telemovel"] = utilizador.telemovel
        resposta["empresa"]   = utilizador.empresa
    if tipo == "condomino":
        resposta["telemovel"]      = utilizador.telemovel
        resposta["id_apartamento"] = utilizador.id_apartamento
        resposta["id_edificio"]    = utilizador.apartamento.id_edificio if utilizador.apartamento else None
    if tipo == "tecnico":
        resposta["funcao"] = utilizador.funcao
    return resposta


@router.put("/alterar-password")
def alterar_pw(dados: AlterarPassword, background: BackgroundTasks,token: dict = Depends(token_atual), db: Session = Depends(get_db)):
    tipo = token["tipo"]
    uid  = token["id"]

    utilizador = obter_utilizador(tipo, uid, db)
    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado")
    if not verificar_pw(dados.pw_atual, utilizador.pw):
        raise HTTPException(400, "A password atual está incorreta.")

    pw_hash    = pw_encript(dados.pw_nova)
    token_conf = token_assign().dumps({"id": uid, "tipo": tipo, "pw": pw_hash}, salt="confirmar-nova-pw")
    link       = f"{cfg.APP_URL}/web_app_visitante/confirmar_pw.html?token={token_conf}"

    background.add_task(enviar_email_confirmacao, utilizador.email, utilizador.nome, link)
    return {"mensagem": f"Enviámos um email de confirmação para {utilizador.email}. Clique no link para concluir a alteração."}


@router.post("/confirmar-nova-password")
def confirmar_npw(body: ConfirmarNovaPassword, db: Session = Depends(get_db)):
    try:
        payload = token_assign().loads(body.token, salt="confirmar-nova-pw", max_age=3600)
    except SignatureExpired:
        raise HTTPException(400, "O link expirou. Solicite uma nova alteração de password.")
    except BadSignature:
        raise HTTPException(400, "Link inválido.")

    utilizador = obter_utilizador(payload["tipo"], payload["id"], db)
    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado.")

    utilizador.pw = payload["pw"]
    db.commit()
    return {"mensagem": "Password alterada com sucesso! Já pode fazer login."}


@router.post("/recuperar-password")
def recuperar_pw(body: RecuperarPassword, request: Request,background: BackgroundTasks, db: Session = Depends(get_db)):
    ip = obter_ip(request)
    verificar_rate_l(ip)

    email = str(body.email).strip().lower()
    utilizador = None
    tipo_encontrado = None

    for tipo_str, modelo in _TABELAS.items():
        u = db.query(modelo).filter(modelo.email == email).first()
        if u:
            utilizador = u
            tipo_encontrado = tipo_str
            break

    if not utilizador:
        return {"mensagem": "Um link foi enviado para o seu email."}

    token_reset = token_assign().dumps({"id": utilizador.id, "tipo": tipo_encontrado}, salt="recuperar-password")
    link        = f"{cfg.APP_URL}/web_app_visitante/reset_pw2.html?token={token_reset}"

    background.add_task(enviar_email_reset, utilizador.email, utilizador.nome, link)
    return {"mensagem": "Um link foi enviado para o seu email."}


@router.post("/reset-password")
def reset_pw(body: ResetPassword, db: Session = Depends(get_db)):
    try:
        payload = token_assign().loads(body.token, salt="recuperar-password", max_age=3600)
    except SignatureExpired:
        raise HTTPException(400, "O link expirou. Solicite um novo reset.")
    except BadSignature:
        raise HTTPException(400, "Link inválido.")

    utilizador = obter_utilizador(payload["tipo"], payload["id"], db)
    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado.")

    utilizador.pw = pw_encript(body.password)
    db.commit()
    return {"mensagem": "Password redefinida com sucesso! Já pode fazer login."}




def enviar_email_confirmacao(email_destino: str, nome: str, link: str) -> None:
    corpo_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">Confirmar alteração de password</p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <p style="font-size:15px;color:#1A1A1A;margin:0 0 16px;">Olá, <strong>{nome}</strong>!</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 24px;">
          Recebemos um pedido para alterar a password da sua conta.<br>
          Clique no botão abaixo para confirmar a alteração.<br>
          <strong>O link expira em 60 minutos.</strong>
        </p>
        <a href="{link}" style="display:inline-block;background:#F08A24;color:#fff;padding:14px 28px;
                                font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;">
          Confirmar nova password
        </a>
        <p style="font-size:12px;color:#6B6860;margin:24px 0 0;">
          Se não foi você a solicitar esta alteração, ignore este email — a sua password permanece inalterada.
        </p>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">© 2026 Sistema de Gestão de Condomínios — Email gerado automaticamente.</p>
      </div>
    </div>
    """
    enviar_email(email_destino, "Confirme a alteração da sua password — Gestão de Condomínios", corpo_html)


def enviar_email_reset(email_destino: str, nome: str, link: str) -> None:
    corpo_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">Recuperação de password</p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <p style="font-size:15px;color:#1A1A1A;margin:0 0 16px;">Olá, <strong>{nome}</strong>!</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 24px;">
          Recebemos um pedido de recuperação de password para a sua conta.<br>
          Clique no botão abaixo para definir uma nova password.<br>
          <strong>O link expira em 60 minutos.</strong>
        </p>
        <a href="{link}" style="display:inline-block;background:#F08A24;color:#fff;padding:14px 28px;
                                font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;">
          Redefinir password
        </a>
        <p style="font-size:12px;color:#6B6860;margin:24px 0 0;">
          Se não foi você a solicitar esta recuperação, ignore este email — a sua password permanece inalterada.
        </p>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">© 2026 Sistema de Gestão de Condomínios — Email gerado automaticamente.</p>
      </div>
    </div>
    """
    enviar_email(email_destino, "Recuperação de password — Gestão de Condomínios", corpo_html)
