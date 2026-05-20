from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.notificacao import Notificacao


def listar(db: Session):
    return db.query(Notificacao).filter(Notificacao.status == 1).all() # Notificações com status 1 são as ativas, ou seja, as que não foram eliminadas (soft delete)


def marcar_como_lida(db: Session, id: int):
    notificacao = db.query(Notificacao).filter(Notificacao.id_notificacao == id, Notificacao.status == 1).first() # Queremos as notificações ativas


    if not notificacao:
        raise HTTPException(404, "Notificação não encontrada")
    
    notificacao.lida = 1 # Marca a notificação como lida, ou seja, lida = 1
    db.commit()
    db.refresh(notificacao)
    return notificacao
