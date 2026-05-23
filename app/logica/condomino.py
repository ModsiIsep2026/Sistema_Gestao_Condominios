from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.condomino import Condomino
from app.configs.seguranca import pw_encript


def listar(db: Session, id_apartamento: int):
    return db.query(Condomino).filter(Condomino.id_apartamento == id_apartamento, Condomino.status == 1).all()


def obter(db: Session, id: int):
    cond = db.query(Condomino).filter(Condomino.id == id, Condomino.status == 1).first()

    if not cond:
        raise HTTPException(404, "Condómino não encontrado")
    return cond


def criar(db: Session, dados):
    condomino = Condomino(
        nome=dados.nome,
        email=dados.email,
        pw=pw_encript(dados.pw),
        telemovel=dados.telemovel,
        id_apartamento=dados.id_apartamento,
    )
    db.add(condomino)
    db.commit()
    db.refresh(condomino)
    return condomino


def atualizar(db: Session, id: int, dados):
    condomino = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(condomino, campo, valor)
    
    db.commit()
    db.refresh(condomino)
    return condomino


def remover(db: Session, id: int):
    condomino = obter(db, id)
    condomino.status = 0
    db.commit()
    return {"detalhe": "Condómino removido"}
