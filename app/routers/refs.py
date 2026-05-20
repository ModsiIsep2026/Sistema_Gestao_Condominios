from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.perfil import LerPerfil
from app.schemas.refs import (
    LerEstadoReserva, LerEstadoOrdemTrabalho,
    LerCategoriaAvaria, LerCategoriaDespesa
)
from app.services import refs as servico

router = APIRouter(prefix="/refs", tags=["Referências"])

# (GET) /refs/perfis                  - Lista todos os perfis
# (GET) /refs/estados/reserva         - Lista estados de reserva
# (GET) /refs/estados/ordem-trabalho  - Lista estados de ordens de trabalho
# (GET) /refs/categorias/avaria       - Lista categorias de avaria
# (GET) /refs/categorias/despesa      - Lista categorias de despesa


@router.get("/perfis", response_model=List[LerPerfil])
def listar_perfis(db: Session = Depends(get_db)):
    return servico.listar_perfis(db)


@router.get("/estados/reserva", response_model=List[LerEstadoReserva])
def listar_estados_reserva(db: Session = Depends(get_db)):
    return servico.listar_estados_reserva(db)


@router.get("/estados/ordem-trabalho", response_model=List[LerEstadoOrdemTrabalho])
def listar_estados_ordem_trabalho(db: Session = Depends(get_db)):
    return servico.listar_estados_ordem_trabalho(db)


@router.get("/categorias/avaria", response_model=List[LerCategoriaAvaria])
def listar_categorias_avaria(db: Session = Depends(get_db)):
    return servico.listar_categorias_avaria(db)



@router.get("/categorias/despesa", response_model=List[LerCategoriaDespesa])
def listar_categorias_despesa(db: Session = Depends(get_db)):
    return servico.listar_categorias_despesa(db)
