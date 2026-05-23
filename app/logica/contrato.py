from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.contrato import Contrato


def listar(db: Session):
    return db.query(Contrato).filter(Contrato.status == 1).all()


def obter_pgestor(db: Session, id_gestor: int):
    contrato = db.query(Contrato).filter(Contrato.id_gestor == id_gestor, Contrato.status == 1).first()

    if not contrato:
        raise HTTPException(404, "Contrato não encontrado")
    return contrato


def criar(db: Session, dados):
    contrato = Contrato(**dados.model_dump())
    db.add(contrato)
    db.commit()
    db.refresh(contrato)
    return contrato


def atualizar(db: Session, id_gestor: int, dados):
    contrato = obter_pgestor(db, id_gestor)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
    for campo, valor in dados.model_dump(exclude_unset=True).items()    setattr(contrato, campo, valor)
    
    db.commit()
    db.refresh(contrato)
    return contrato
