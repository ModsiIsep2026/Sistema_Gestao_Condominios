from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


class CriarPagamento(BaseModel):
    quota_id: int
    utilizador_id: int
    valor_pago: Decimal
    data_pagamento: date


class LerPagamento(BaseModel):
    id_pagamento: int
    quota_id: int
    utilizador_id: int
    valor_pago: Decimal
    data_pagamento: date
    status: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
