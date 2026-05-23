from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Pagamento(BaseModel):
    id_apartamento: int
    mes: str  # formato YYYY-MM
    valor: float
    data_i: datetime


class CriarPagamento(Pagamento):
    pass


class AtualizarPagamento(BaseModel):
    estado: Optional[int] = None                # 0=pendente 1=pago
    data_p: Optional[datetime] = None
    status: Optional[int] = None                # 1=ativo 0=cancelado


class LerPagamento(Pagamento):
    id: int
    status: int
    data_p: Optional[datetime] = None
    estado: int  

    class Config:
        from_attributes = True
