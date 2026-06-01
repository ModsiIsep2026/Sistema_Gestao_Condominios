from pydantic import BaseModel, model_validator
from datetime import datetime, timezone


class AluguerBase(BaseModel):
    data_inicio: datetime
    data_fim: datetime

    @model_validator(mode="after")
    def datas_validas(self):
        if self.data_fim <= self.data_inicio:
            raise ValueError("A data de fim tem de ser posterior à data de início.")
        agora = datetime.now(timezone.utc)
        inicio = self.data_inicio if self.data_inicio.tzinfo else self.data_inicio.replace(tzinfo=timezone.utc)
        if inicio < agora:
            raise ValueError("Não é possível adicionar datas do passado")
        return self
