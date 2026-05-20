from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal


class CriarDespesa(BaseModel):
    edificio_id: int
    gestor_id: int
    fornecedor_id: Optional[int] = None
    categoria_id: int
    valor: Decimal
    data_despesa: date


class AtualizarDespesa(BaseModel):
    fornecedor_id: Optional[int] = None
    categoria_id: Optional[int] = None
    valor: Optional[Decimal] = None
    data_despesa: Optional[date] = None
    status: Optional[int] = None


class LerDespesa(BaseModel):
    id_despesa: int
    edificio_id: int
    gestor_id: int
    fornecedor_id: Optional[int] = None
    categoria_id: int
    valor: Decimal
    data_despesa: date
    status: int

    class Config:
        from_attributes = True