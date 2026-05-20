from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db_connect import get_db
from app.schemas.auth import Login, Token
from app.services import auth as servico
from app.core.seguranca import criar_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
def login(dados: Login, db: Session = Depends(get_db)):
    utilizador = servico.autenticar(db, dados.email, dados.password)

    token = criar_token({"sub": str(utilizador.id_utilizador), "perfil": utilizador.perfil_id})
    return {"access_token": token, 
            "token_type": "bearer"}


@router.post("/logout")
def logout():
    return {"detalhe": "Sessão terminada"}
