from pydantic import BaseModel
from typing import Optional
from datetime import date


class CriarUtilizadorFracao(BaseModel):
    utilizador_id: int
    fracao_id: int
    data_inicio: date
    data_fim: Optional[date] = None


class LerUtilizadorFracao(BaseModel):
    id_utilizador_fracao: int
    utilizador_id: int
    fracao_id: int
    data_inicio: date
    data_fim: Optional[date] = None
    status: int

    class Config:
        from_attributes = True