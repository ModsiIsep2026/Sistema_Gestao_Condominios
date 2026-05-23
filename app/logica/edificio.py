from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.edificio import Edificio
from app.tabelas_bd.contrato import Contrato
from app.tabelas_bd.licenca import Licenca


def listar(db: Session, id_gestor: int):
    return db.query(Edificio).filter(Edificio.id_gestor == id_gestor, Edificio.status == 1).all()


def listar_todos(db: Session):
    return db.query(Edificio).filter(Edificio.status == 1).all()


def obter(db: Session, id: int):
    edificio = db.query(Edificio).filter(Edificio.id == id, Edificio.status == 1).first()

    if not edificio:
        raise HTTPException(404, "Edifício não encontrado")
    return edificio


def criar(db: Session, dados, id_gestor: int):
    contrato = (
        db.query(Contrato)
        .filter(Contrato.id_gestor == id_gestor, Contrato.status == 1)
        .first()
    )
    if not contrato:
        raise HTTPException(403, "Sem contrato ativo")

    licenca = db.query(Licenca).filter(Licenca.id == contrato.id_licenca).first()
    total = db.query(Edificio).filter(Edificio.id_gestor == id_gestor, Edificio.status == 1).count()

    if total >= licenca.num_edificios:
        raise HTTPException(403, f"Limite de edifícios atingido ({licenca.num_edificios})")

    edificio = Edificio(**dados.model_dump(), id_gestor=id_gestor)
    db.add(edificio)
    db.commit()
    db.refresh(edificio)
    return edificio


def atualizar(db: Session, id: int, dados):
    edificio = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(edificio, campo, valor)

    db.commit()
    db.refresh(edificio)
    return edificio


def remover(db: Session, id: int):
    edificio = obter(db, id)
    edificio.status = 0
    db.commit()
    return {"detalhe": "Edifício removido"}
