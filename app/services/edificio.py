from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.edificio import Edificio
from app.schemas.edificio import CriarEdificio, AtualizarEdificio


def listar(db: Session):
    return db.query(Edificio).filter(Edificio.status == 1).all() # Edifícios com status 1 são os ativos, ou seja, os que não foram eliminados (soft delete)


def obter(db: Session, id: int):
    edificio = db.query(Edificio).filter(Edificio.id_edificio == id, Edificio.status == 1).first()

    if not edificio:
        raise HTTPException(404, "Edifício não encontrado no sistema")
    return edificio


def criar(db: Session, dados: CriarEdificio):
    edificio = Edificio(**dados.model_dump())
    db.add(edificio)
    db.commit() 
    db.refresh(edificio)
    return edificio


def atualizar(db: Session, id: int, dados: AtualizarEdificio):
    edificio = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(edificio, k, v)
    db.commit()
    db.refresh(edificio)
    return edificio


def remover(db: Session, id: int):
    edificio = obter(db, id)
    edificio.status = 0 # Softdelete , o registo fica sempre no sistema , só não está ativo
    db.commit()
    return {"detalhe": "Edifício removido do sistema"}