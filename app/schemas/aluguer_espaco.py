from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional


class CriarAluguerEspaco(BaseModel):
    id_espaco: int
    data_inicio: datetime
    data_fim: datetime

    @model_validator(mode="after")
    def datas_validas(self):
        if self.data_fim <= self.data_inicio:
            raise ValueError("A data de fim tem de ser posterior à data de início.")
        if self.data_inicio < datetime.now():
            raise ValueError("Não é possível adicionar datas do passado")
        return self


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
