from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class FracaoBase(BaseModel):
    edificio_id: int
    codigo_fracao: str
    andar: Optional[str] = None
    area_m2: Optional[Decimal] = None


class CriarFracao(FracaoBase):
    pass


class AtualizarFracao(BaseModel):
    edificio_id: Optional[int] = None
    codigo_fracao: Optional[str] = None
    andar: Optional[str] = None
    area_m2: Optional[Decimal] = None
    status: Optional[int] = None


class LerFracao(FracaoBase):
    id_fracao: int
    status: int

    class Config:
        from_attributes = True