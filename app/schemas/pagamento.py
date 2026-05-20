from pydantic import BaseModel
from datetime import date
from decimal import Decimal


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

    class Config:
        from_attributes = True