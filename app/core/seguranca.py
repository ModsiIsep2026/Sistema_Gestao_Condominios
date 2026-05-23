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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

credenciais_invalidas = HTTPException(
    status_code=401,
    detail="Token inválido ou expirado",
    headers={"WWW-Authenticate": "Bearer"},
)
ACESSO_NEGADO = HTTPException(status_code=403, detail="Acesso negado")


# ── Passwords ──────────────────────────────────────────────────────────────────

def pw_encript(pw: str) -> str:
    return pwd_context.hash(pw)


def verificar_pw(pw: str, pw_hash: str) -> bool:
    try:
        return pwd_context.verify(pw, pw_hash)
    except UnknownHashError:
        return False


def random_pw(tamanho: int = 12) -> str:
    EXCLUIR = set("0O1lI")
    alfabeto = [c for c in (string.ascii_letters + string.digits) if c not in EXCLUIR]
    while True:
        pw = "".join(secrets.choice(alfabeto) for _ in range(tamanho))
        if any(c.isupper() for c in pw) and any(c.islower() for c in pw) and any(c.isdigit() for c in pw):
            return pw


# ── JWT ────────────────────────────────────────────────────────────────────────

def criar_token(id: int, tipo: str) -> str:
    configs = get_configs()
    payload = {
        "sub": str(id),
        "tipo": tipo,
        "exp": datetime.utcnow() + timedelta(minutes=configs.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, configs.APP_SECRET_KEY, algorithm=configs.ALGORITHM)


def token_atual(token: str = Depends(oauth2_scheme)) -> dict:
    configs = get_configs()
    try:
        payload = jwt.decode(token, configs.APP_SECRET_KEY, algorithms=[configs.ALGORITHM])
        sub = payload.get("sub")
        tipo = payload.get("tipo")
        if sub is None or tipo is None:
            raise credenciais_invalidas
        return {"id": int(sub), "tipo": tipo}
    except JWTError:
        raise credenciais_invalidas


# ── Dependencies por tipo ──────────────────────────────────────────────────────

def so_admin(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
    if dados["tipo"] != "admin":
        raise ACESSO_NEGADO
    from app.models.admin import Admin
    u = db.query(Admin).filter(Admin.id == dados["id"], Admin.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u


def so_gestor(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
    if dados["tipo"] != "gestor":
        raise ACESSO_NEGADO
    from app.models.gestor import Gestor
    u = db.query(Gestor).filter(Gestor.id == dados["id"], Gestor.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u


def so_condomino(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
    if dados["tipo"] != "condomino":
        raise ACESSO_NEGADO
    from app.models.condomino import Condomino
    u = db.query(Condomino).filter(Condomino.id == dados["id"], Condomino.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u


def so_tecnico(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
    if dados["tipo"] != "tecnico":
        raise ACESSO_NEGADO
    from app.models.tecnico import Tecnico
    u = db.query(Tecnico).filter(Tecnico.id == dados["id"], Tecnico.status == 1).first()
    if not u:
        raise credenciais_invalidas
    return u
