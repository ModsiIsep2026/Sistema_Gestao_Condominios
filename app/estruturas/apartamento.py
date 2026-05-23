from pydantic import BaseModel
from typing import Optional


class Apartamento(BaseModel):
    fracao: str
    andar: Optional[int] = None
    id_edificio: int
    permilagem: float


class CriarApartamento(Apartamento):
    pass


class AtualizarApartamento(BaseModel):
    fracao: Optional[str] = None
    andar: Optional[int] = None
    permilagem: Optional[float] = None
    status: Optional[int] = None


class LerApartamento(Apartamento):
    id: int
    status: int

    class Config:
        from_attributes = True
