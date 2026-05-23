from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.tecnico import Tecnico
from app.core.seguranca import pw_encript


def listar(db: Session, id_gestor: int):
    return db.query(Tecnico).filter(Tecnico.id_gestor == id_gestor, Tecnico.status == 1).all()


def obter(db: Session, id: int):
    tecnico = db.query(Tecnico).filter(Tecnico.id == id, Tecnico.status == 1).first()

    if not tecnico:
        raise HTTPException(404, "Técnico não encontrado")
    return tecnico


def criar(db: Session, dados):
    tecnico = Tecnico(
        nome=dados.nome,
        funcao=dados.funcao,
        email=dados.email,
        pw=pw_encript(dados.pw),
        id_gestor=dados.id_gestor,
    )
    db.add(tecnico)
    db.commit()
    db.refresh(tecnico)
    return tecnico


def atualizar(db: Session, id: int, dados):
    tecnico = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():setattr(tecnico, campo, valor)
    
    db.commit()
    db.refresh(tecnico)
    return tecnico


def remover(db: Session, id: int):
    tecnico = obter(db, id)
    tecnico.status = 0
    db.commit()
    return {"detalhe": "Técnico removido"}
