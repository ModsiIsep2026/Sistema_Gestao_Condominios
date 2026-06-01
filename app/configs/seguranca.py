import secrets
import string
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.configs.config import get_configs
from app.configs.db_connect import get_db
from app.tabelas_bd.admin import Admin
from app.tabelas_bd.gestor import Gestor
from app.tabelas_bd.condomino import Condomino
from app.tabelas_bd.tecnico import Tecnico

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_encriptada = CryptContext(schemes=["bcrypt"], deprecated="auto")

credenciais_invalidas = HTTPException(status_code=401,
    detail="Token inválido",
    headers={"WWW-Authenticate": "Bearer"},
)

ACESSO_NEGADO = HTTPException(status_code=403, detail="Acesso negado")
IGNORAR_C = set("0O1lI")  # O gestor vai receber uma pw mas vamos ignorar estes valores na construcao da pw

TABELAS = {
    "admin":     Admin,
    "gestor":    Gestor,
    "condomino": Condomino,
    "tecnico":   Tecnico,
}


# Recebe a pw e retorna encriptada através da bibilioteca CryptoContext
def pw_encript(pw: str) -> str:
    return pwd_encriptada.hash(pw)

# Verificar se a pw inicial e a cript são "iguais"
def verificar_pw(pw: str, pw_hash: str) -> bool:
    try:
        return pwd_encriptada.verify(pw, pw_hash)
    except UnknownHashError:
        return False

# O gestor paga e recebe uma pw aleatória no seu email
def random_pw(tamanho: int = 12) -> str:
    letras = [ch for ch in (string.ascii_letters + string.digits) if ch not in IGNORAR_C]

    while True:
        pw = "".join(secrets.choice(letras) for _ in range(tamanho)) # pw com 12 caracteres
        if any(ch.isupper() for ch in pw) and any(ch.islower() for ch in pw) and any(ch.isdigit() for ch in pw):
            return pw


# Json Web Token (JWT)
def criar_token(id: int, tipo: str) -> str:
    configs = get_configs()
    agora = datetime.now(timezone.utc)
    conteudo = {
        "sub": str(id),
        "tipo": tipo,
        "exp": agora + timedelta(minutes=configs.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": agora,
    }
    return jwt.encode(conteudo, configs.APP_SECRET_KEY, algorithm=configs.ALGORITHM)


def token_atual(token: str = Depends(oauth2_scheme)) -> dict:

    configs = get_configs()
    try:
        conteudo = jwt.decode(token, configs.APP_SECRET_KEY, algorithms=[configs.ALGORITHM])
        sub = conteudo.get("sub")
        tipo = conteudo.get("tipo")

        if sub is None or tipo is None:
            raise credenciais_invalidas
        return {"id": int(sub), "tipo": tipo}
    except JWTError:
        raise credenciais_invalidas


def verificar_perfil(tipo: str):
    def perfis(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
        
        if dados["tipo"] != tipo:
            raise ACESSO_NEGADO
        modelo = TABELAS[tipo]
        u = db.query(modelo).filter(modelo.id == dados["id"], modelo.status == 1).first()
        if not u:
            raise credenciais_invalidas
        return u
    return perfis

verificar_a = verificar_perfil("admin")
verificar_g = verificar_perfil("gestor")
verificar_c = verificar_perfil("condomino")
verificar_t = verificar_perfil("tecnico")
