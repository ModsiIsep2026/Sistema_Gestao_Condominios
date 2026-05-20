from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.despesa import Despesa
from app.schemas.despesa import CriarDespesa, AtualizarDespesa


def listar(db: Session):
    return db.query(Despesa).filter(Despesa.status == 1).all() # despesas com status 1 são as ativas, ou seja, as que não foram eliminadas (soft delete)


def obter(db: Session, id: int):
    despesa = db.query(Despesa).filter(Despesa.id_despesa == id, Despesa.status == 1).first()
    
    if not despesa:
        raise HTTPException(404, "Despesa não encontrada")
    return despesa


def criar(db: Session, dados: CriarDespesa):
    despesa = Despesa(**dados.model_dump()) 
    db.add(despesa)
    db.commit()
    db.refresh(despesa)
    return despesa


def atualizar(db: Session, id: int, dados: AtualizarDespesa):
    despesa = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():setattr(despesa, k, v) # Atualiza os campos da avaria com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(despesa)
    return despesa