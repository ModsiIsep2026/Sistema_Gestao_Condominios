from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.edificio import CriarEdificio, AtualizarEdificio, LerEdificio
from app.services import edificio as servico

router = APIRouter(prefix="/edificios", tags=["Edifícios"])


@router.get("", response_model=List[LerEdificio])
def listar_edificios(db: Session = Depends(get_db)):
    return servico.listar(db)



@router.get("/{id}", response_model=LerEdificio)
def obter_edificio(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)



@router.post("", response_model=LerEdificio, status_code=201)
def criar_edificio(dados: CriarEdificio, db: Session = Depends(get_db)):
    return servico.criar(db, dados)



@router.put("/{id}", response_model=LerEdificio)
def atualizar_edificio(id: int, dados: AtualizarEdificio, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)



@router.delete("/{id}")
def remover_edificio(id: int, db: Session = Depends(get_db)):
    return servico.remover(db, id)
