from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor
from app.schemas.edificio import CriarEdificio, AtualizarEdificio, LerEdificio
from app.services import edificio as servico

router = APIRouter(prefix="/edificios", tags=["Edifícios"])

# (GET)    /edificios       - Lista edifícios do gestor
# (GET)    /edificios/{id}  - Obtém edifício
# (POST)   /edificios       - Cria edifício
# (PUT)    /edificios/{id}  - Atualiza edifício
# (DELETE) /edificios/{id}  - Remove edifício (soft delete)


@router.get("", response_model=List[LerEdificio])
def listar(gestor=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar(db, gestor.id)


@router.get("/{id}", response_model=LerEdificio)
def obter(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerEdificio, status_code=201)
def criar(dados: CriarEdificio, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerEdificio)
def atualizar(id: int, dados: AtualizarEdificio, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.remover(db, id)
