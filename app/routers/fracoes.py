from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.fracao import CriarFracao, AtualizarFracao, LerFracao
from app.services import fracao as servico

router = APIRouter(prefix="/fracoes", tags=["Frações"])


@router.get("", response_model=List[LerFracao])
def listar_fracoes(db: Session = Depends(get_db)):
    return servico.listar(db)



@router.get("/{id}", response_model=LerFracao)
def obter_fracao(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)



@router.post("", response_model=LerFracao, status_code=201)
def criar_fracao(dados: CriarFracao, db: Session = Depends(get_db)):
    return servico.criar(db, dados)



@router.put("/{id}", response_model=LerFracao)
def atualizar_fracao(id: int, dados: AtualizarFracao, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)



@router.delete("/{id}")
def remover_fracao(id: int, db: Session = Depends(get_db)):
    return servico.remover(db, id)
