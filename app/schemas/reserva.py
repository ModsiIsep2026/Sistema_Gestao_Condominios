from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CriarReserva(BaseModel):
    utilizador_id: int
    espaco_id: int
    estado_id: int
    data_inicio: datetime
    data_fim: datetime


class AtualizarReserva(BaseModel):
    aprovador_id: Optional[int] = None
    estado_id: Optional[int] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    status: Optional[int] = None


class LerReserva(BaseModel):
    id_reserva: int
    utilizador_id: int
    espaco_id: int
    aprovador_id: Optional[int] = None
    estado_id: int
    data_inicio: datetime
    data_fim: datetime
    status: int

    class Config:
        from_attributes = True