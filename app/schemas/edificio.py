from pydantic import BaseModel
from typing import Optional


class EdificioBase(BaseModel):
    nome: str
    morada: str
    codigo_postal: Optional[str] = None
    cidade: Optional[str] = None


class CriarEdificio(EdificioBase):
    pass


class AtualizarEdificio(BaseModel):
    nome: Optional[str] = None
    morada: Optional[str] = None
    codigo_postal: Optional[str] = None
    cidade: Optional[str] = None
    status: Optional[int] = None


class LerEdificio(EdificioBase):
    id_edificio: int
    status: int

    class Config:
        from_attributes = True