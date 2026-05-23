from pydantic import BaseModel
from datetime import date
from typing import Optional


class Contrato(BaseModel):
    id_licenca: int
    id_gestor: int
    data_inicio: date
    data_fim: date


class CriarContrato(Contrato):
    pass # o gestor vai mexer nos contratos, apenas vai selecionar e pagar


class AtualizarContrato(BaseModel):
    id_licenca: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    status: Optional[int] = None


class LerContrato(Contrato):
    id: int
    status: int

    class Config:
        from_attributes = True
