from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from jose import JWTError, jwt

from app.services.utilizador import obter_por_email
from app.core.seguranca import verificar_password, hash_password, criar_token
from app.core.config import get_configs
from app.services.email import enviar_email
from app.models.log_acesso import LogAcesso
from app.models.utilizador import Utilizador


PERFIL_CONDOMINO = 2


def _registar_log(db: Session, acao: str, resultado: str, utilizador_id=None, ip: str = None):
    log = LogAcesso(
        utilizador_id=utilizador_id,
        acao=acao,
        timestamp=datetime.utcnow(),
        ip_address=ip,
        resultado=resultado,
    )
    db.add(log)
    db.commit()


def autenticar(db: Session, email: str, password: str, ip: str = None):
    utilizador = obter_por_email(db, email)

    if not utilizador or not verificar_password(password, utilizador.password_hash):
        _registar_log(db, acao="login_failed", resultado="falhou", ip=ip)
        raise HTTPException(401, "Email ou password inválidos")

    _registar_log(db, acao="login", resultado="sucesso", utilizador_id=utilizador.id_utilizador, ip=ip)
    return utilizador


def registar_logout(db: Session, utilizador_id: int, ip: str = None):
    _registar_log(db, acao="logout", resultado="sucesso", utilizador_id=utilizador_id, ip=ip)


def registar_condomino(db: Session, dados, ip: str = None):
    if obter_por_email(db, dados.email):
        _registar_log(db, acao="registo_email_duplicado", resultado="falhou", ip=ip)
        raise HTTPException(400, "Já existe uma conta com este email.")

    utilizador = Utilizador(
        perfil_id=PERFIL_CONDOMINO,
        nome=dados.nome.strip(),
        email=dados.email,
        password_hash=hash_password(dados.password),
        telemovel=dados.telemovel,
        nif=dados.nif,
        lingua=dados.lingua,
        status=1,
    )
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)

    _registar_log(db, acao="registo", resultado="sucesso", utilizador_id=utilizador.id_utilizador, ip=ip)
    return utilizador


async def pass_err(db: Session, email: str):
    utilizador = obter_por_email(db, email)
    configs = get_configs()

    if utilizador:
        token = criar_token({
            "sub": str(utilizador.id_utilizador),
            "purpose": "reset_password",
        })

        reset_url = f"{configs.APP_URL.rstrip('/')}{configs.PASSWORD_RESET_PATH}?token={token}"

        texto = (
            f"Olá {utilizador.nome},\n\n"
            "Recebemos um pedido de recuperação de password para a sua conta.\n"
            f"Acesse o link abaixo para escolher uma nova password:\n\n{reset_url}\n\n"
            "Se não pediu a recuperação de password, ignore este email.\n"
        )

        html = (
            f"<p>Olá {utilizador.nome},</p>"
            "<p>Recebemos um pedido de recuperação de password para a sua conta.</p>"
            f"<p><a href=\"{reset_url}\">Clique aqui para repor a sua password</a></p>"
            "<p>Se não pediu a recuperação de password, ignore este email.</p>"
        )

        await enviar_email(
            destinatario=utilizador.email,
            assunto="Recuperação de password — Sistema de Gestão de Condomínios",
            corpo_texto=texto,
            corpo_html=html,
        )

        _registar_log(db, acao="esqueci_password", resultado="sucesso", utilizador_id=utilizador.id_utilizador)

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


def reset_password(db: Session, token: str, password: str, ip: str = None):
    
    user_id = token_reset(token)
    utilizador = db.query(Utilizador).filter(Utilizador.id_utilizador == user_id, Utilizador.status == 1).first()

    if not utilizador:
        raise HTTPException(400, "Token de recuperação inválido ou expirado")

    utilizador.password_hash = hash_password(password)
    db.commit()

    _registar_log(db, acao="reset_password", resultado="sucesso", utilizador_id=utilizador.id_utilizador, ip=ip)
    return True