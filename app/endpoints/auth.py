from collections import defaultdict
from datetime import datetime, timedelta
import threading
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.configs.db_connect import get_db
from app.configs.seguranca import criar_token, token_atual
from app.estruturas.auth import Login, Token
from app.logica import auth as servico

router = APIRouter(prefix="/auth", tags=["Auth"])

# Rate limiting — máx 5 tentativas por IP em 5 min
_tentativas: dict = defaultdict(list)
_lock = threading.Lock()

def verificar_rl(ip: str):
    agora = datetime.utcnow()
    limite = agora - timedelta(seconds=300)
    with _lock:
        _tentativas[ip] = [t for t in _tentativas[ip] if t > limite]
        if len(_tentativas[ip]) >= 5:
            raise HTTPException(429, "Demasiadas tentativas. Aguarde alguns minutos.")

def registar_falha(ip: str):
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
    verificar_rl(ip)
    try:
        if dados.perfil:
            utilizador = servico.autenticar(db, dados.email, dados.pw, dados.perfil)
            tipo = dados.perfil
        else:
            utilizador, tipo = servico.autenticar_auto(db, dados.email, dados.pw)
    except HTTPException:
        registar_falha(ip)
        raise
    token = criar_token(utilizador.id, tipo)
    return Token(access_token=token, token_type="bearer", perfil_utilizador=tipo, id=utilizador.id)


@router.get("/conta")
def me(dados: dict = Depends(token_atual), db: Session = Depends(get_db)):
    tipo = dados["tipo"]
    uid  = dados["id"]

    if tipo == "admin":
        from app.tabelas_bd.admin import Admin
        utilizador = db.query(Admin).filter(Admin.id == uid).first()
    elif tipo == "gestor":
        from app.tabelas_bd.gestor import Gestor
        utilizador = db.query(Gestor).filter(Gestor.id == uid).first()
    elif tipo == "condomino":
        from app.tabelas_bd.condomino import Condomino
        utilizador = db.query(Condomino).filter(Condomino.id == uid).first()
    elif tipo == "tecnico":
        from app.tabelas_bd.tecnico import Tecnico
        utilizador = db.query(Tecnico).filter(Tecnico.id == uid).first()
    else:
        raise HTTPException(400, "Tipo desconhecido")

    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado")

    return {"id": utilizador.id, "nome": utilizador.nome, "email": utilizador.email, "tipo": tipo}
