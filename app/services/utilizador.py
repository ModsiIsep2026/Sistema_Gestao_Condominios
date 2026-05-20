from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.utilizador import Utilizador
from app.schemas.utilizador import CriarUtilizador, AtualizarUtilizador
from app.core.seguranca import hash_password


def listar(db: Session):
    return db.query(Utilizador).filter(Utilizador.status == 1).all() # Utilizadores com status 1 são os ativos, ou seja, os que não foram eliminados (soft delete)


def obter(db: Session, id: int):
    utilizador = db.query(Utilizador).filter(Utilizador.id_utilizador == id, Utilizador.status == 1).first()

    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado")
    return utilizador


def obter_por_email(db: Session, email: str):
    return db.query(Utilizador).filter(Utilizador.email == email, Utilizador.status == 1).first()


def criar(db: Session, dados: CriarUtilizador):
    if obter_por_email(db, dados.email):

        raise HTTPException(400, "Email já registado")
    
    payload = dados.model_dump(exclude={"password"}) # Payload é o conteúdo exceto a password
    payload["password_hash"] = hash_password(dados.password)
    utilizador = Utilizador(**payload)
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)
    return utilizador


def atualizar(db: Session, id: int, dados: AtualizarUtilizador):
    utilizador = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():setattr(utilizador, k, v) # Atualiza os campos do utilizador com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(utilizador)
    return utilizador


def remover(db: Session, id: int):
    utilizador = obter(db, id)
    utilizador.status = 0 # Softdelete , o registo fica sempre no sistema , só não está ativo
    db.commit()
    return {"detalhe": "Utilizador removido"}