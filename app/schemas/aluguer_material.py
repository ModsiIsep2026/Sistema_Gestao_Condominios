from pydantic import BaseModel, field_validator, model_validator
from datetime import datetime
from typing import Optional


class AluguerMaterial(BaseModel):
    id_material_espaco: int
    id_condomino: int
    qtd_alugada: int = 1
    data_inicio: datetime
    data_fim: datetime

    @field_validator("qtd_alugada")
    @classmethod
    def qtd_positiva(cls, quantidade: int) -> int:
        if quantidade < 1:
            raise ValueError("A quantidade alugada tem de ser pelo menos 1.")
        return quantidade

    @model_validator(mode="after")
    def datas_validas(self):
        if self.data_fim <= self.data_inicio:
            raise ValueError("A data de fim tem de ser posterior à data de início.")

        if self.data_inicio < datetime.now():
            raise ValueError("Não é possível adicionar datas do passado")

        return self


class CriarAluguerMaterial(AluguerMaterial):
    pass


class AtualizarAluguerMaterial(BaseModel):
    qtd_alugada: Optional[int] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    status: Optional[int] = None


class AluguerMaterialRead(AluguerMaterial):
    id: int
    preco_total: float

    class Config:
        from_attributes = True