from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.ordem_trabalho import OrdemTrabalho
from app.schemas.ordem_trabalho import CriarOrdemTrabalho, AtualizarOrdemTrabalho


def listar(db: Session):
    return db.query(OrdemTrabalho).filter(OrdemTrabalho.status == 1).all() # Ordens de trabalho com status 1 são as ativas, ou seja, as que não foram eliminadas (soft delete)


def obter(db: Session, id: int):
    ordens_trabalho = db.query(OrdemTrabalho).filter(OrdemTrabalho.id_ordem == id, OrdemTrabalho.status == 1).first() 


    if not ordens_trabalho:
        raise HTTPException(404, "Ordem de trabalho não encontrada")
    return ordens_trabalho


def criar(db: Session, dados: CriarOrdemTrabalho):
    ot = OrdemTrabalho(**dados.model_dump())
    db.add(ot)
    db.commit()
    db.refresh(ot)
    return ot


def atualizar(db: Session, id: int, dados: AtualizarOrdemTrabalho):
    ordens_trabalho = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(ordens_trabalho, k, v)
    db.commit()
    db.refresh(ordens_trabalho)
    return ordens_trabalho
