from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CriarPagamento(BaseModel):
    id_apartamento: int
    mes: str  # formato YYYY-MM


class LerPagamento(BaseModel):
    id: int
    id_apartamento: int
    mes: str
    valor: float
    data_i: datetime
    data_p: Optional[datetime] = None
    estado: int   # 0=pendente, 1=pago
    status: int   # 1=ativo, 0=cancelado

    class Config:
        from_attributes = True
