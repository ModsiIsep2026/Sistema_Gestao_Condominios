from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.edificio import Edificio


def listar(db: Session, id_gestor: int):
    return db.query(Edificio).filter(Edificio.id_gestor == id_gestor, Edificio.status == 1).all()


def obter(db: Session, id: int):
    edificio = db.query(Edificio).filter(Edificio.id == id, Edificio.status == 1).first()
    
    if not edificio:
        raise HTTPException(404, "Edifício não encontrado")
    return edificio


def criar(db: Session, dados):
    edificio = Edificio(**dados.model_dump())
    db.add(edificio)
    db.commit()
    db.refresh(edificio)
    return edificio


def atualizar(db: Session, id: int, dados):
    edificio = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():setattr(edificio, campo, valor)
    
    db.commit()
    db.refresh(edificio)
    return edificio


def remover(db: Session, id: int):
    edificio = obter(db, id)
    edificio.status = 0
    db.commit()
    return {"detalhe": "Edifício removido"}
