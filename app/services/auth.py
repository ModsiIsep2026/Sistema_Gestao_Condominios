from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.utilizador import obter_por_email
from app.core.seguranca import verificar_password
from app.models.log_acesso import LogAcesso


def autenticar(db: Session, email: str, password: str):
    utilizador = obter_por_email(db, email)

    if not utilizador or not verificar_password(password, utilizador.password_hash):
        raise HTTPException(401, "Email ou password inválidos")

    log = LogAcesso(utilizador_id=utilizador.id_utilizador, acao="login", timestamp=datetime.utcnow())
    db.add(log)
    db.commit()

    return utilizador