from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.reserva import Reserva
from app.schemas.reserva import CriarReserva, AtualizarReserva


def listar(db: Session):
    return db.query(Reserva).filter(Reserva.status == 1).all() # Reservas com status 1 são as ativas, ou seja, as que não foram eliminadas (soft delete)


def obter(db: Session, id: int):
    reserva = db.query(Reserva).filter(Reserva.id_reserva == id, Reserva.status == 1).first()
    
    if not reserva:
        raise HTTPException(404, "Reserva não encontrada")
    return reserva


def criar(db: Session, dados: CriarReserva):
    reserva = Reserva(**dados.model_dump())
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva


def atualizar(db: Session, id: int, dados: AtualizarReserva):
    reserva = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():setattr(reserva, k, v) # Atualiza os campos da reserva com os dados fornecidos, mas apenas os que foram efetivamente enviados (exclude_unset=True), os outros deixa ficar
    db.commit()
    db.refresh(reserva)
    return reserva