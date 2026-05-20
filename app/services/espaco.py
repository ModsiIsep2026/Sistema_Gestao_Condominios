from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.espaco_comum import EspacoComum
from app.schemas.espaco_comum import CriarEspaco, AtualizarEspaco


def listar(db: Session):
    return db.query(EspacoComum).filter(EspacoComum.status == 1).all() # Espaços comuns com status 1 são os ativos, ou seja, os que não foram eliminados (soft delete)


def obter(db: Session, id: int):
    espaco = db.query(EspacoComum).filter(EspacoComum.id_espaco == id, EspacoComum.status == 1).first()

    if not espaco:
        raise HTTPException(404, "Espaço não encontrado")
    return espaco


def criar(db: Session, dados: CriarEspaco):
    espaco = EspacoComum(**dados.model_dump())
    db.add(espaco)
    db.commit()
    db.refresh(espaco)
    return espaco


def atualizar(db: Session, id: int, dados: AtualizarEspaco):
    espaco = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():setattr(espaco, k, v) # Atualiza os campos do espaço comum com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(espaco)
    return espaco