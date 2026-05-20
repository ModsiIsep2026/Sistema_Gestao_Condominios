from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal


class QuotaBase(BaseModel):
    fracao_id: int
    valor: Decimal
    mes_referencia: date


class CriarQuota(QuotaBase):
    pass


class AtualizarQuota(BaseModel):
    valor: Optional[Decimal] = None
    mes_referencia: Optional[date] = None
    status: Optional[int] = None


class LerQuota(QuotaBase):
    id_quota: int
    status: int

    class Config:
        from_attributes = True