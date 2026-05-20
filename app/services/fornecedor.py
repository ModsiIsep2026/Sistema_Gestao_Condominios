from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.fornecedor import Fornecedor
from app.schemas.fornecedor import CriarFornecedor, AtualizarFornecedor


def listar(db: Session):
    return db.query(Fornecedor).filter(Fornecedor.status == 1).all() # Fornecedores com status 1 são os ativos, ou seja, os que não foram eliminados (soft delete)


def obter(db: Session, id: int):
    fornecedor = db.query(Fornecedor).filter(Fornecedor.id_fornecedor == id, Fornecedor.status == 1).first()

    if not fornecedor:
        raise HTTPException(404, "Fornecedor não encontrado")
    return fornecedor


def criar(db: Session, dados: CriarFornecedor):
    fornecedor = Fornecedor(**dados.model_dump())
    db.add(fornecedor)
    db.commit()
    db.refresh(fornecedor)
    return fornecedor


def atualizar(db: Session, id: int, dados: AtualizarFornecedor):
    fornecedor = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():setattr(fornecedor, k, v) # Atualiza os campos do fornecedor com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(fornecedor)
    return fornecedor
