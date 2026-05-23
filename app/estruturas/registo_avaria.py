from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RegistoAvaria(BaseModel):
    zona: str
    descricao: Optional[str] = None
    id_edificio: int


class CriarRegistoAvaria(RegistoAvaria):
    pass


class AtualizarRegistoAvaria(BaseModel):
    zona: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[int] = None                         


class LerRegistoAvaria(RegistoAvaria):
    id: int
    id_condomino: int
    data_registo: datetime
    status: int

    class Config:
        from_attributes = True
