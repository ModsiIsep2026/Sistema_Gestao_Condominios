from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.ordem_trabalho import OrdemTrabalho
from app.models.avaria import Avaria
from app.schemas.ordem_trabalho import CriarOrdemTrabalho, AtualizarOrdemTrabalho


def listar(db: Session):
    return db.query(OrdemTrabalho).filter(OrdemTrabalho.status == 1).all() # Ordens de trabalho com status 1 são as ativas, ou seja, as que não foram eliminadas (soft delete)


def listar_por_utilizador(db: Session, utilizador_id: int):
    return (
        db.query(OrdemTrabalho)
        .join(Avaria, OrdemTrabalho.avaria)
        .filter(OrdemTrabalho.status == 1, Avaria.utilizador_id == utilizador_id)
        .all()
    )


def obter(db: Session, id: int):
    ordens_trabalho = db.query(OrdemTrabalho).filter(OrdemTrabalho.id_ordem == id, OrdemTrabalho.status == 1).first() 


    if not ordens_trabalho:
        raise HTTPException(404, "Ordem de trabalho não encontrada")
    return ordens_trabalho


def criar(db: Session, dados: CriarOrdemTrabalho):
    ordens_trabalho = OrdemTrabalho(**dados.model_dump())
    db.add(ordens_trabalho)
    db.commit()
    db.refresh(ordens_trabalho)
    return ordens_trabalho


def atualizar(db: Session, id: int, dados: AtualizarOrdemTrabalho):
    ordens_trabalho = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(ordens_trabalho, k, v)
    db.commit()
    db.refresh(ordens_trabalho)
    return ordens_trabalho
