from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor
from app.schemas.tecnico import CriarTecnico, AtualizarTecnico, LerTecnico
from app.services import tecnico as servico

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])

# (GET)    /tecnicos       - Lista técnicos do gestor
# (GET)    /tecnicos/{id}  - Obtém técnico
# (POST)   /tecnicos       - Cria técnico
# (PUT)    /tecnicos/{id}  - Atualiza técnico
# (DELETE) /tecnicos/{id}  - Remove técnico


@router.get("", response_model=List[LerTecnico])
def listar(gestor=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar(db, gestor.id)


@router.get("/{id}", response_model=LerTecnico)
def obter(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerTecnico, status_code=201)
def criar(dados: CriarTecnico, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerTecnico)
def atualizar(id: int, dados: AtualizarTecnico, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.remover(db, id)
