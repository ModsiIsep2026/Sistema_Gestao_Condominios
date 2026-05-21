from pydantic import BaseModel
from typing import Optional
from datetime import date


class CriarGestorEdificio(BaseModel):
    gestor_id: int
    edificio_id: int
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None


class AtualizarGestorEdificio(BaseModel):
    data_fim: Optional[date] = None
    status: Optional[int] = None


class LerGestorEdificio(BaseModel):
    id_gestor_edificio: int
    gestor_id: int
    edificio_id: int
    data_inicio: date
    data_fim: Optional[date] = None
    status: int

    class Config:
        from_attributes = True
