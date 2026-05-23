from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.espaco import Espaco


def listar(db: Session, id_edificio: int):
    return db.query(Espaco).filter(Espaco.id_edificio == id_edificio, Espaco.status == 1).all()


def obter(db: Session, id: int):
    espaco = db.query(Espaco).filter(Espaco.id == id, Espaco.status == 1).first()
    
    if not espaco:
        raise HTTPException(404, "Espaço não encontrado")
    return espaco


def criar(db: Session, dados):
    espaco = Espaco(**dados.model_dump())
    db.add(espaco)
    db.commit()
    db.refresh(espaco)
    return espaco


def atualizar(db: Session, id: int, dados):
    espaco = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
    for campo, valor in dados.model_dump(exclude_unset=True).items()    setattr(espaco, campo, valor)
    
    db.commit()
    db.refresh(espaco)
    return espaco


def remover(db: Session, id: int):
    espaco = obter(db, id)
    espaco.status = 0
    db.commit()
    return {"detalhe": "Espaço removido"}
