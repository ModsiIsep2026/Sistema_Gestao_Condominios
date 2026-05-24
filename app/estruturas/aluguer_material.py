from pydantic import BaseModel, field_validator
from datetime import datetime

from app.estruturas.aluguer_base import AluguerBase


class CriarAluguerMaterial(AluguerBase):
    id_material_espaco: int
    qtd_alugada: int = 1

    @field_validator("qtd_alugada")
    @classmethod
    def qtd_positiva(cls, quantidade: int) -> int:
        if quantidade < 1:
            raise ValueError("A quantidade alugada tem de ser pelo menos 1.")
        return quantidade


class LerAluguerMaterial(BaseModel):
    id: int
    id_material_espaco: int
    id_condomino: int
    qtd_alugada: int
    data_inicio: datetime
    data_fim: datetime
    preco_total: float

    class Config:
        from_attributes = True
