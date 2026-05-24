from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, verificar_t
from app.estruturas.tecnico import CriarTecnico, AtualizarTecnico, LerTecnico
from app.logica import tecnico as servico

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])


@router.get("", response_model=List[LerTecnico])
def listar(gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar(db, gestor.id)


@router.put("/conta", response_model=LerTecnico)
def atualizar_pperfil(dados: AtualizarTecnico, tecnico=Depends(verificar_t), db: Session = Depends(get_db)):
    return servico.atualizar(db, tecnico.id, dados)


@router.get("/{id}", response_model=LerTecnico)
def obter(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerTecnico, status_code=201)
def criar(dados: CriarTecnico, background: BackgroundTasks,
          gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.criar(db, dados, gestor.id, background)


@router.put("/{id}", response_model=LerTecnico)
def atualizar(id: int, dados: AtualizarTecnico, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.remover(db, id)
