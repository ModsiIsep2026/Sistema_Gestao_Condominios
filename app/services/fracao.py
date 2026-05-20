from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.fracao import Fracao
from app.schemas.fracao import CriarFracao, AtualizarFracao


def listar(db: Session):
    return db.query(Fracao).filter(Fracao.status == 1).all() # Frações com status 1 são as ativas, ou seja, as que não foram eliminadas (soft delete)


def obter(db: Session, id: int):
    fracao = db.query(Fracao).filter(Fracao.id_fracao == id, Fracao.status == 1).first()

    if not fracao:
        raise HTTPException(404, "Fração não encontrada")
    return fracao   


def criar(db: Session, dados: CriarFracao):
    fracao = Fracao(**dados.model_dump())
    db.add(fracao)
    db.commit()
    db.refresh(fracao)
    return fracao


def atualizar(db: Session, id: int, dados: AtualizarFracao):
    fracao = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():setattr(fracao, k, v) # Atualiza os campos da fração com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(fracao)
    return fracao


def remover(db: Session, id: int):
    fracao = obter(db, id)
    fracao.status = 0 # Softdelete , o registo fica sempre no sistema , só não está ativo
    db.commit()
    return {"detalhe": "Fração removida"}