from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor
from app.schemas.apartamento import CriarApartamento, AtualizarApartamento, LerApartamento
from app.services import apartamento as servico

router = APIRouter(prefix="/apartamentos", tags=["Apartamentos"])

# (GET)    /apartamentos              - Lista por edifício (?id_edificio=)
# (GET)    /apartamentos/{id}         - Obtém apartamento
# (POST)   /apartamentos              - Cria apartamento
# (PUT)    /apartamentos/{id}         - Atualiza apartamento
# (DELETE) /apartamentos/{id}         - Remove apartamento


@router.get("", response_model=List[LerApartamento])
def listar(id_edificio: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar(db, id_edificio)


@router.get("/{id}", response_model=LerApartamento)
def obter(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerApartamento, status_code=201)
def criar(dados: CriarApartamento, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerApartamento)
def atualizar(id: int, dados: AtualizarApartamento, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.remover(db, id)
