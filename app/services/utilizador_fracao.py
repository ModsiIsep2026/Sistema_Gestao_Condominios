from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.utilizador_fracao import UtilizadorFracao
from app.schemas.utilizador_fracao import CriarUtilizadorFracao


def listar(db: Session):
    return db.query(UtilizadorFracao).filter(UtilizadorFracao.status == 1).all() # Associação de um perfil com uma fração deve ter status 1 (ativas)


def associar(db: Session, dados: CriarUtilizadorFracao):
    utilizador_fracao = UtilizadorFracao(**dados.model_dump())
    db.add(utilizador_fracao)
    db.commit()
    db.refresh(utilizador_fracao)
    return utilizador_fracao


def remover(db: Session, id: int):
    utilizador_fracao = db.query(UtilizadorFracao).filter(
        UtilizadorFracao.id_utilizador_fracao == id, UtilizadorFracao.status == 1).first()
    
    if not utilizador_fracao:
        raise HTTPException(404, "Associação não encontrada")
    
    utilizador_fracao.status = 0 # Softdelete , o registo fica sempre no sistema , só não está ativo
    db.commit()
    return {"detalhe": "Associação removida"}