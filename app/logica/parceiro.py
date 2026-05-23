from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.parceiro import Parceiro


def listar(db: Session):
    return db.query(Parceiro).filter(Parceiro.status == 1).all()


def obter(db: Session, id: int):
    parceiro = db.query(Parceiro).filter(Parceiro.id == id, Parceiro.status == 1).first()

    if not parceiro:
        raise HTTPException(404, "Parceiro externo não encontrado")
    return parceiro


def criar(db: Session, dados, id_admin: int):
    parceiro = Parceiro(**dados.model_dump(), id_admin=id_admin)
    db.add(parceiro)
    db.commit()
    db.refresh(parceiro)
    return parceiro


def atualizar(db: Session, id: int, dados):
    parceiro = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
    for campo, valor in dados.model_dump(exclude_unset=True).items()    setattr(parceiro, campo, valor)
    
    db.commit()
    db.refresh(parceiro)
    return parceiro


def remover(db: Session, id: int):
    parceiro = obter(db, id)
    parceiro.status = 0
    db.commit()
    return {"detalhe": "Parceiro removido"}
