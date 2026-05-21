import secrets
import string
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
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
# pw= password
PERFIL_VISITANTE = 1 
PERFIL_CONDOMINO = 2
PERFIL_GESTOR = 3
PERFIL_TECNICO = 4
PERFIL_ADMINISTRADOR = 5 


_credenciais_invalidas = HTTPException(status_code=401, detail="Token inválido ou expirado", headers={"WWW-Authenticate": "Bearer"})
ACESSO_NEGADO = HTTPException(status_code=403, detail="Acesso negado")


def hash_pw(password: str) -> str:

    return pwd_context.hash(password)


def random_pw(tamanho: int = 12) -> str:
    
    pw_maiusc = string.ascii_uppercase # asci contém as letras do alfabeto em maiusculo
    pw_minusc = string.ascii_lowercase # asci contém as letras do alfabeto em minusculo
    digitos = string.digits
    pw_completa = pw_maiusc +  pw_minusc + digitos


    while True:

        pw = "".join(secrets.choice(pw_completa) for _ in range(tamanho))
        if (any(c.isupper() for c in pw)
                and any(c.islower() for c in pw)
                and any(c.isdigit() for c in pw)):
            return pw


def verificar_pw(password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(password, password_hash)
    
    except UnknownHashError:
        return False


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


def requer_perfis(*perfis: int):
    def _check(utilizador: Utilizador = Depends(utilizador_atual)):
        if utilizador.perfil_id not in perfis:
            raise ACESSO_NEGADO
        return utilizador
    return _check


administrador           = requer_perfis(PERFIL_ADMINISTRADOR)
gestor_ou_administrador = requer_perfis(PERFIL_GESTOR, PERFIL_ADMINISTRADOR)
tecnico_ou_superior     = requer_perfis(PERFIL_TECNICO, PERFIL_GESTOR, PERFIL_ADMINISTRADOR)
perfis2_5               = requer_perfis(PERFIL_CONDOMINO, PERFIL_TECNICO, PERFIL_GESTOR, PERFIL_ADMINISTRADOR) 
