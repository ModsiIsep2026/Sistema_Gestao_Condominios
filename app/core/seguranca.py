from passlib.context import CryptContext                            # Configurar hash de passwords para gerar strings de 60 caracteres.
from jose import jwt, JWTError                                      # Json Web Token (JWT) para autenticação
from datetime import datetime, timedelta  
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer                   # Extrair o token do header Authorization
from sqlalchemy.orm import Session
from app.core.config import get_configs
from app.core.db_connect import get_db
from app.models.utilizador import Utilizador
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")       # deprecated está a auto porque o sistema atualiza-se sozinho perante novas versões


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verificar_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)                  # Verifica se a password e o hash ficam iguais



def criar_token(dados: dict) -> str:

    configs = get_configs()
    payload = dados.copy() 
    payload["exp"] = datetime.utcnow() + timedelta(minutes=configs.ACCESS_TOKEN_EXPIRE_MINUTES) # O token expira após 30minutos
    return jwt.encode(payload, configs.APP_SECRET_KEY, algorithm=configs.ALGORITHM)



def utilizador_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    configs = get_configs()
    
    try:
        payload = jwt.decode(token, configs.APP_SECRET_KEY, algorithms=[configs.ALGORITHM])
        user_id: int = payload.get("sub") #  No "sub" vamos guardar o id do utilizador

        if user_id is None:
            raise HTTPException(401, "Token inválido")
        
    except JWTError:
        raise HTTPException(401, "Token inválido ou expirado")
    
    utilizador = db.query(Utilizador).filter(Utilizador.id_utilizador == int(user_id)).first()

    if not utilizador or utilizador.status != 1:

        raise HTTPException(401, "Utilizador inativo ou não encontrado")
    
    return utilizador