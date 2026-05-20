from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import get_configs
from app.core.db_connect import get_db
from app.models.utilizador import Utilizador

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


_credenciais_invalidas = HTTPException(status_code=401,detail="Token inválido ou expirado",headers={"WWW-Authenticate": "Bearer"},)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verificar_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def criar_token(dados: dict) -> str:
    configs = get_configs()
    payload = dados.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=configs.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["iat"] = datetime.utcnow()  # issued-at para auditoria
    return jwt.encode(payload, configs.APP_SECRET_KEY, algorithm=configs.ALGORITHM)


def utilizador_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    configs = get_configs()

    try:
        payload = jwt.decode(token, configs.APP_SECRET_KEY, algorithms=[configs.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise _credenciais_invalidas
    except JWTError:
        raise _credenciais_invalidas

    utilizador = db.query(Utilizador).filter(Utilizador.id_utilizador == int(user_id)).first()

    if not utilizador or utilizador.status != 1:
        raise _credenciais_invalidas

    return utilizador