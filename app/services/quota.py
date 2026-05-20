from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.quota import Quota
from app.models.utilizador_fracao import UtilizadorFracao
from app.schemas.quota import CriarQuota, AtualizarQuota


def listar(db: Session):
    return db.query(Quota).filter(Quota.status == 1).all() # Quotas com status 1 são as ativas, ou seja, as que não foram eliminadas (soft delete)


def listar_por_utilizador(db: Session, utilizador_id: int):
    fracao_ids = (db.query(UtilizadorFracao.fracao_id).filter(UtilizadorFracao.status == 1, UtilizadorFracao.utilizador_id == utilizador_id).subquery() #  associar um utilizador à sua fração(casa)
    )
    return db.query(Quota).filter(Quota.status == 1, Quota.fracao_id.in_(fracao_ids)).all()


def obter(db: Session, id: int):
    quota = db.query(Quota).filter(Quota.id_quota == id, Quota.status == 1).first() 

    if not quota:
        raise HTTPException(404, "Quota não encontrada")
    return quota


def criar(db: Session, dados: CriarQuota):
    quota = Quota(**dados.model_dump())
    db.add(quota)
    db.commit()
    db.refresh(quota)
    return quota


def atualizar(db: Session, id: int, dados: AtualizarQuota):
    quota = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(quota, k, v)  # Atualiza os campos da quota com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(quota)
    return quota