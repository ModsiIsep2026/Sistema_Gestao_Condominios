from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.ordem_trabalho import CriarOrdemTrabalho, AtualizarOrdemTrabalho, LerOrdemTrabalho
from app.services import ordem_trabalho as servico

router = APIRouter(prefix="/ordens-trabalho", tags=["Ordens de Trabalho"])


@router.get("", response_model=List[LerOrdemTrabalho])
def listar_ordens(db: Session = Depends(get_db)):
    return servico.listar(db)



@router.get("/{id}", response_model=LerOrdemTrabalho)
def obter_ordem(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)



@router.post("", response_model=LerOrdemTrabalho, status_code=201)
def criar_ordem(dados: CriarOrdemTrabalho, db: Session = Depends(get_db)):
    return servico.criar(db, dados)



@router.put("/{id}", response_model=LerOrdemTrabalho)
def atualizar_ordem(id: int, dados: AtualizarOrdemTrabalho, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)
