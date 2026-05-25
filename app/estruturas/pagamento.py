from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CriarPagamento(BaseModel):
    id_apartamento: int
    mes: str  # formato YYYY-MM


class LerEdificioResumoPag(BaseModel):
    id: int
    rua: str
    cidade: Optional[str] = None

    class Config:
        from_attributes = True


class LerAptResumoPag(BaseModel):
    id: int
    fracao: str
    andar: Optional[int] = None
    id_edificio: int
    edificio: Optional[LerEdificioResumoPag] = None

    class Config:
        from_attributes = True


class LerPagamento(BaseModel):
    id: int
    id_apartamento: int
    mes: str
    valor: float
    data_i: datetime
    data_p: Optional[datetime] = None
    estado: int   # 0=pendente, 1=pago
    status: int   # 1=ativo, 0=cancelado
    apartamento: Optional[LerAptResumoPag] = None

    class Config:
        from_attributes = True
