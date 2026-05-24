from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.estruturas.aluguer_base import AluguerBase


class CriarAluguerEspaco(AluguerBase):
    id_espaco: int


class LerAluguerEspaco(BaseModel):
    id: int
    id_espaco: int
    id_condomino: int
    data_inicio: datetime
    data_fim: datetime
    preco_total: float
    status: int

    class Config:
        from_attributes = True
