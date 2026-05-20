from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CriarOrdemTrabalho(BaseModel):
    avaria_id: int
    gestor_id: int
    tecnico_id: Optional[int] = None
    fornecedor_id: Optional[int] = None
    estado_id: int
    data_inicio: datetime


class AtualizarOrdemTrabalho(BaseModel):
    tecnico_id: Optional[int] = None
    fornecedor_id: Optional[int] = None
    estado_id: Optional[int] = None
    data_fim: Optional[datetime] = None
    status: Optional[int] = None


class LerOrdemTrabalho(BaseModel):
    id_ordem: int
    avaria_id: int
    tecnico_id: Optional[int] = None
    gestor_id: int
    fornecedor_id: Optional[int] = None
    estado_id: int
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    status: int

    class Config:
        from_attributes = True