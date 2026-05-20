from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.db_connect import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verificar_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)



def criar_token(dados: dict) -> str:
    settings = get_settings()
    payload = dados.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.APP_SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from app.models.utilizador import Utilizador
    settings = get_settings()
    
    try:
        payload = jwt.decode(token, settings.APP_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")

        if user_id is None:
            raise HTTPException(401, "Token inválido")
        
    except JWTError:
        raise HTTPException(401, "Token inválido ou expirado")
    
    utilizador = db.query(Utilizador).filter(Utilizador.id_utilizador == int(user_id)).first()

    if not utilizador or utilizador.status != 1:

        raise HTTPException(401, "Utilizador inativo ou não encontrado")
    
    return utilizador