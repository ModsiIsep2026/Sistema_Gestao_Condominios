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
    db.add(avaria) 
    db.commit() # Cada avaria tem um ticket atribuido automaticamente
    db.refresh(avaria) # Atualiza a db com esse novo ticket
    return avaria


def atualizar(db: Session, id: int, dados: AtualizarAvaria):
    avaria = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():setattr(avaria, k, v) # Atualiza os campos da avaria com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(avaria)
    return avaria