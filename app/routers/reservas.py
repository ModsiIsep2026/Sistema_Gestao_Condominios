from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.reserva import CriarReserva, AtualizarReserva, LerReserva
from app.services import reserva as servico

router = APIRouter(prefix="/reservas", tags=["Reservas"])

# (GET)  /reservas       - Lista todas as reservas
# (GET)  /reservas/{id}  - Obtém os detalhes de uma reserva específica
# (POST) /reservas       - Cria uma nova reserva
# (PUT)  /reservas/{id}  - Atualiza uma reserva existente


@router.get("", response_model=List[LerReserva])
def listar_reservas(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerReserva)
def obter_reserva(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerReserva, status_code=201)
def criar_reserva(dados: CriarReserva, db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerReserva)
def atualizar_reserva(id: int, dados: AtualizarReserva, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)
