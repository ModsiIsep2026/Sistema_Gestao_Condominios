from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from jose import JWTError, jwt

from app.services.utilizador import obter_por_email
from app.core.seguranca import verificar_pw, hash_pw, criar_token
from app.core.config import get_configs
from app.services.email import enviar_email, template_reset_pw
from app.models.log_acesso import LogAcesso
from app.models.utilizador import Utilizador


PERFIL_CONDOMINO = 2


def registar_log(db: Session, acao: str, resultado: str, utilizador_id=None, ip: str = None):
    log = LogAcesso(
        utilizador_id=utilizador_id,
        acao=acao,
        timestamp=datetime.utcnow(),
        ip_address=ip,
        resultado=resultado,
    )
    db.add(log)
    db.commit()


def log_ok(db, acao, utilizador_id=None, ip=None):
    registar_log(db, acao=acao, resultado="sucesso", utilizador_id=utilizador_id, ip=ip)


def log_falha(db, acao, ip=None):
    registar_log(db, acao=acao, resultado="falhou", ip=ip)


def autenticar(db: Session, email: str, password: str, ip: str = None):
    utilizador = obter_por_email(db, email)

    if not utilizador or not verificar_pw(password, utilizador.password_hash):
        log_falha(db, "login_failed", ip)
        raise HTTPException(401, "Email ou password inválidos")

    log_ok(db, "login", utilizador.id_utilizador, ip)
    return utilizador


def registar_logout(db: Session, utilizador_id: int, ip: str = None):
    log_ok(db, "logout", utilizador_id, ip)


def registar_condomino(db: Session, dados, ip: str = None):

    if obter_por_email(db, dados.email):
        log_falha(db, "registo_email_duplicado", ip)
        raise HTTPException(400, "Já existe uma conta com este email.")

    utilizador = Utilizador(
        perfil_id=PERFIL_CONDOMINO,
        nome=dados.nome.strip(),
        email=dados.email,
        password_hash=hash_pw(dados.password),
        telemovel=dados.telemovel,
        nif=dados.nif,
        lingua=dados.lingua,
        status=1,
    )
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)

    log_ok(db, "registo", utilizador.id_utilizador, ip)
    return utilizador


async def pass_err(db: Session, email: str):
    utilizador = obter_por_email(db, email)
    if not utilizador:
        return True  

    configs = get_configs()
    token = criar_token({"sub": str(utilizador.id_utilizador), "purpose": "reset_password"})
    reset_url = f"{configs.APP_URL.rstrip('/')}{configs.PASSWORD_RESET_PATH}?token={token}"

    texto, html = template_reset_pw(
        nome=utilizador.nome,
        link=reset_url,
        minutos=configs.PASSWORD_RESET_EXPIRE_MINUTES,
    )
    await enviar_email(
        destinatario=utilizador.email,
        assunto="Recuperação de password — Sistema de Gestão de Condomínios",
        corpo_texto=texto,
        corpo_html=html,
    )

    log_ok(db, "repor_pw_link", utilizador.id_utilizador)
    return True


def token_reset(token: str) -> int:
    configs = get_configs()
    try:
        payload = jwt.decode(token, configs.APP_SECRET_KEY, algorithms=[configs.ALGORITHM])

        if payload.get("purpose") != "reset_password":
            raise HTTPException(400, "Token de recuperação inválido")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(400, "Token de recuperação inválido")
        return int(user_id)
    except JWTError:
        raise HTTPException(400, "Token de recuperação inválido ou expirado")


def reset_pw(db: Session, token: str, password: str, ip: str = None):
    
    user_id = token_reset(token)
    utilizador = db.query(Utilizador).filter(
        Utilizador.id_utilizador == user_id, Utilizador.status == 1
    ).first()

    if not utilizador:
        raise HTTPException(400, "Token de recuperação inválido ou expirado")

    utilizador.password_hash = hash_pw(password)
    db.commit()

    log_ok(db, "nova_pw", utilizador.id_utilizador, ip)
    return True
