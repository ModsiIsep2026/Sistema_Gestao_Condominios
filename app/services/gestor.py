from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.gestor import Gestor
from app.core.seguranca import hash_pw


def listar(db: Session):
    return db.query(Gestor).filter(Gestor.status == 1).all()


def obter(db: Session, id: int):
    gestor = db.query(Gestor).filter(Gestor.id == id, Gestor.status == 1).first()
    
    if not gestor:
        raise HTTPException(404, "Gestor não encontrado")
    return gestor


def criar(db: Session, dados):
    gestor = Gestor(
        nome=dados.nome,
        empresa=dados.empresa,
        telemovel=dados.telemovel,
        email=dados.email,
        pw=hash_pw(dados.pw),
    )
    db.add(gestor)
    db.commit()
    db.refresh(gestor)
    return gestor


def atualizar(db: Session, id: int, dados):
    gestor = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():setattr(gestor, campo, valor)
    
    db.commit()
    db.refresh(gestor)
    return gestor


def remover(db: Session, id: int):
    gestor = obter(db, id)
    gestor.status = 0
    db.commit()
    return {"detalhe": "Gestor removido"}
