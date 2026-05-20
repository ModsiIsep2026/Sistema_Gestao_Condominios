from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db_connect import get_db
from app.schemas.auth import Login
from app.services import auth as servico

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(dados: Login, db: Session = Depends(get_db)):
    utilizador = servico.autenticar(db, dados.email, dados.password)
    
    return {
        "id_utilizador": utilizador.id_utilizador,
        "nome": utilizador.nome,
        "perfil_id": utilizador.perfil_id
    }


@router.post("/logout")
def logout():
    return {"detalhe": "Sessão terminada"}
