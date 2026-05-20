from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.avaria import Avaria
from app.schemas.avaria import CriarAvaria, AtualizarAvaria


def listar(db: Session):
    return db.query(Avaria).filter(Avaria.status == 1).all()


def obter(db: Session, id: int):
    avaria = db.query(Avaria).filter(Avaria.id_avaria == id, Avaria.status == 1).first() #o Status tem de ser 1 para garantir que a avaria não foi eliminada (soft delete)

    if not avaria:
        raise HTTPException(404, "Avaria não encontrada")
    return avaria


def criar(db: Session, dados: CriarAvaria):
    avaria = Avaria(**dados.model_dump())
    db.add(avaria)                               # Cada avaria tem um ticket atribuido automaticamente
    db.commit()                                  # Regista a avaria na base de dados
    db.refresh(avaria)                           
    return avaria


def atualizar(db: Session, id: int, dados: AtualizarAvaria):
    avaria = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items(): # Apenas atualiza os dados que foram enviados no pedido
        setattr(avaria, k, v)
    db.commit()
    db.refresh(avaria)
    return avaria