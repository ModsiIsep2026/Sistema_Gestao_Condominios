from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.apartamento import Apartamento


def listar(db: Session, id_edificio: int):
    return db.query(Apartamento).filter(Apartamento.id_edificio == id_edificio, Apartamento.status == 1).all()


def obter(db: Session, id: int):
    apt = db.query(Apartamento).filter(Apartamento.id == id, Apartamento.status == 1).first()

    if not apt:
        raise HTTPException(404, "Apartamento não encontrado")
    return apt


def criar(db: Session, dados):
    apt = Apartamento(**dados.model_dump())
    db.add(apt)
    db.commit()
    db.refresh(apt)
    return apt


def atualizar(db: Session, id: int, dados):
    apt = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(apt, campo, valor)
    
    db.commit()
    db.refresh(apt)
    return apt


def remover(db: Session, id: int):
    apt = obter(db, id)
    apt.status = 0
    db.commit()
    return {"detalhe": "Apartamento removido"}
