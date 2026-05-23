import secrets
import string
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.configs.config import get_configs
from app.configs.db_connect import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_encriptada = CryptContext(schemes=["bcrypt"], deprecated="auto")

credenciais_invalidas = HTTPException(status_code=401,
    detail="Token inválido",
    headers={"WWW-Authenticate": "Bearer"},
)

ACESSO_NEGADO = HTTPException(status_code=403, detail="Acesso negado")
IGNORAR_C = set("0O1lI")    # O gestor vai receber uma pw mas vamos ignorar estes valores na construcao da pw


# ── Passwords ──────────────────────────────────────────────────────────────────
# Recebe a pw e retorna encriptada através da bibilioteca  CryptoContext
def pw_encript(pw: str) -> str:
    return pwd_encriptada.hash(pw)

# Verificar se a pw inicial e a cript são "iguais"
def verificar_pw(pw: str, pw_hash: str) -> bool:
    try:
        return pwd_encriptada.verify(pw, pw_hash)
    except UnknownHashError:
        return False


def random_pw(tamanho: int = 12) -> str:
    letras = [ch for ch in (string.ascii_letters + string.digits) if ch not in IGNORAR_C]

    while True:
        pw = "".join(secrets.choice(letras) for _ in range(tamanho)) # pw com 12 caracteres
        if any(ch.isupper() for ch in pw) and any(ch.islower() for ch in pw) and any(ch.isdigit() for ch in pw):
            return pw


# Json Web Token (JWT)
def criar_token(id: int, tipo: str) -> str:
    
    configs = get_configs()
    conteudo = {
        "sub": str(id),
        "tipo": tipo,
        "exp": datetime.utcnow() + timedelta(minutes=configs.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
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



# Verificar o perfil quando acedem
def verificar_a(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):

    if dados["tipo"] != "admin":
        raise ACESSO_NEGADO
    
    from app.tabelas_bd.admin import Admin

    u = db.query(Admin).filter(Admin.id == dados["id"], Admin.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u


def verificar_g(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):

    if dados["tipo"] != "gestor":
        raise ACESSO_NEGADO
    
    from app.tabelas_bd.gestor import Gestor

    u = db.query(Gestor).filter(Gestor.id == dados["id"], Gestor.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u


def verificar_c(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):

    if dados["tipo"] != "condomino":

        raise ACESSO_NEGADO
    
    from app.tabelas_bd.condomino import Condomino

    u = db.query(Condomino).filter(Condomino.id == dados["id"], Condomino.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u


def verificar_t(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):

    if dados["tipo"] != "tecnico":

        raise ACESSO_NEGADO
    
    from app.tabelas_bd.tecnico import Tecnico

    u = db.query(Tecnico).filter(Tecnico.id == dados["id"], Tecnico.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u
