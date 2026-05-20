from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.utilizador_fracao import CriarUtilizadorFracao, LerUtilizadorFracao
from app.services import utilizador_fracao as servico

router = APIRouter(prefix="/utilizador-fracao", tags=["Utilizador Fração"])


@router.get("", response_model=List[LerUtilizadorFracao])
def listar_utilizador_fracao(db: Session = Depends(get_db)):
    return servico.listar(db)



@router.post("", response_model=LerUtilizadorFracao, status_code=201)
def associar_utilizador_fracao(dados: CriarUtilizadorFracao, db: Session = Depends(get_db)):
    return servico.associar(db, dados)



@router.delete("/{id}")
def remover_utilizador_fracao(id: int, db: Session = Depends(get_db)):
    return servico.remover(db, id)
