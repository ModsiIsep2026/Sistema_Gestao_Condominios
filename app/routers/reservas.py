from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import gestor_ou_administrador, utilizador_atual, ACESSO_NEGADO
from app.schemas.reserva import CriarReserva, AtualizarReserva, LerReserva
from app.services import reserva as servico

router = APIRouter(prefix="/reservas", tags=["Reservas"])

# (GET)  /reservas       - Lista todas as reservas
# (GET)  /reservas/{id}  - Obtém os detalhes de uma reserva específica
# (POST) /reservas       - Cria uma nova reserva
# (PUT)  /reservas/{id}  - Atualiza uma reserva existente


@router.get("", response_model=List[LerReserva])
def listar_reservas(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id in [3, 5]:
        return servico.listar(db)
    return servico.listar_por_utilizador(db, utilizador.id_utilizador)


@router.get("/{id}", response_model=LerReserva)
def obter_reserva(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    reserva = servico.obter(db, id)
    if utilizador.perfil_id in [3, 5] or reserva.utilizador_id == utilizador.id_utilizador:
        return reserva
    raise ACESSO_NEGADO


@router.post("", response_model=LerReserva, status_code=201)
def criar_reserva(
    dados: CriarReserva,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if dados.utilizador_id != utilizador.id_utilizador:
        raise HTTPException(status_code=403, detail="Só pode registar reservas para si próprio")
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerReserva)
def atualizar_reserva(
    id: int,
    dados: AtualizarReserva,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.atualizar(db, id, dados)
