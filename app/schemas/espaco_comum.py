from pydantic import BaseModel
from typing import Optional


class EspacoBase(BaseModel):
    edificio_id: int
    nome: str
    capacidade: Optional[int] = None


class CriarEspaco(EspacoBase):
    pass


class AtualizarEspaco(BaseModel):
    nome: Optional[str] = None
    capacidade: Optional[int] = None
    status: Optional[int] = None


class LerEspaco(EspacoBase):
    id_espaco: int
    status: int

    class Config:
        from_attributes = True