from collections import defaultdict
from datetime import datetime, timedelta
import threading
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.db_connect import get_db
from app.core.seguranca import criar_token
from app.schemas.auth import Login, Token
from app.services import auth as servico

router = APIRouter(prefix="/auth", tags=["Auth"])

# Rate limiting — máx 5 tentativas por IP em 5 min
_tentativas: dict = defaultdict(list)
_lock = threading.Lock()

def _verificar_rl(ip: str):
    agora = datetime.utcnow()
    limite = agora - timedelta(seconds=300)
    with _lock:
        _tentativas[ip] = [t for t in _tentativas[ip] if t > limite]
        if len(_tentativas[ip]) >= 5:
            raise HTTPException(429, "Demasiadas tentativas. Aguarde alguns minutos.")

def _registar_falha(ip: str):
    with _lock:
        _tentativas[ip].append(datetime.utcnow())

def _obter_ip(request: Request) -> str:
    fw = request.headers.get("X-Forwarded-For")
    if fw:
        return fw.split(",")[0].strip()
    return request.client.host if request.client else "desconhecido"


@router.post("/login", response_model=Token)
def login(dados: Login, request: Request, db: Session = Depends(get_db)):
    ip = _obter_ip(request)
    _verificar_rl(ip)
    try:
        utilizador = servico.autenticar(db, dados.email, dados.pw, dados.perfil)
    except HTTPException:
        _registar_falha(ip)
        raise
    token = criar_token(utilizador.id, dados.perfil)
    return Token(access_token=token, token_type="bearer", perfil_utilizador=dados.perfil, id=utilizador.id)
