from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.estruturas.aluguer_base import AluguerBase


class CriarAluguerEspaco(AluguerBase):
    id_espaco: int


class LerAptResumo(BaseModel):
    fracao: str
    andar: Optional[int] = None

    class Config:
        from_attributes = True


class LerCondominoResumo(BaseModel):
    id: int
    nome: str
    apartamento: Optional[LerAptResumo] = None

    class Config:
        from_attributes = True


class LerEspacoResumo(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True


class LerAluguerEspaco(BaseModel):
    id: int
    id_espaco: int
    id_condomino: int
    data_inicio: datetime
    data_fim: datetime
    preco_total: float
    status: int
    condomino: Optional[LerCondominoResumo] = None
    espaco: Optional[LerEspacoResumo] = None

    class Config:
        from_attributes = True
