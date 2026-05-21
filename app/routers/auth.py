from collections import defaultdict
from datetime import datetime, timedelta
import threading

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.db_connect import get_db
from app.core.seguranca import criar_token, utilizador_atual
from app.schemas.auth import Login, Token, Registo, EPassword, ResetPassword
from app.services import auth as servico

router = APIRouter(prefix="/auth", tags=["Auth"])

# (POST) /auth/login   - Autentica o utilizador 
# (POST) /auth/logout  - Regista logout do utilizador 
# (POST) /auth/registo - Regista novo utilizador (condómino)


# A07: rate limiting  — máximo 5 tentativas por IP em 5 minutos
_tentativas: dict = defaultdict(list)
_lock = threading.Lock()
_MAX_TENTATIVAS = 5
SEP_SEGUNDOS = 300


def verificar_rt(ip: str):
    agora = datetime.utcnow()
    limite = agora - timedelta(seconds=SEP_SEGUNDOS)

    with _lock:
        _tentativas[ip] = [t for t in _tentativas[ip] if t > limite]
        if len(_tentativas[ip]) >= _MAX_TENTATIVAS:
            raise HTTPException(429, "Demasiadas tentativas de login. Aguarde alguns minutos.")
        _tentativas[ip].append(agora)


def obter_ip(request: Request) -> str:
    
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "desconhecido"


@router.post("/login", response_model=Token)
def login(dados: Login, request: Request, db: Session = Depends(get_db)):
    ip = obter_ip(request)
    verificar_rt(ip)

    utilizador = servico.autenticar(db, dados.email, dados.password, ip=ip)
    token = criar_token({"sub": str(utilizador.id_utilizador), "perfil": utilizador.perfil_id})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db), utilizador=Depends(utilizador_atual)):
    ip = obter_ip(request)
    servico.registar_logout(db, utilizador.id_utilizador, ip=ip)
    return {"detalhe": "Sessão terminada"}


@router.post("/registo", response_model=Token, status_code=201)
def registo(dados: Registo, request: Request, db: Session = Depends(get_db)):
    ip = obter_ip(request)

    verificar_rt(ip)                                                                # mesma proteção rate-limit do login


    utilizador = servico.registar_condomino(db, dados, ip=ip)

    token = criar_token({"sub": str(utilizador.id_utilizador), "perfil": utilizador.perfil_id})


    return {"access_token": token, "token_type": "bearer"}



@router.post("/pass-err")
async def pass_err(dados: EPassword, request: Request, db: Session = Depends(get_db)):
    ip = obter_ip(request)
    verificar_rt(ip)

    await servico.pass_err(db, dados.email)
    return {"detalhe": "Vai receber instruções para recuperar a sua password."}


@router.post("/reset-password")
def reset_pw(dados: ResetPassword, request: Request, db: Session = Depends(get_db)):
    
    ip = obter_ip(request)

    verificar_rt(ip)

    servico.reset_pw(db, dados.token, dados.password, ip=ip)

    return {"detalhe": "Password alterada com sucesso."}
