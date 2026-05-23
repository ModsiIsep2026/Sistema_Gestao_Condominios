from pydantic import BaseModel
from typing import Optional


class Edificio(BaseModel):
    rua: str
    cp: str
    cidade: Optional[str] = None
    lat: float
    lng: float
    iban: str
    valor_base_mensal: float
    id_gestor: int


class CriarEdificio(Edificio):
    pass


class AtualizarEdificio(BaseModel):
    rua: Optional[str] = None    # O utilizador apenas atualiza a coluna que pretender
    cp: Optional[str] = None
    cidade: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    iban: Optional[str] = None
    valor_base_mensal: Optional[float] = None
    status: Optional[int] = None


class LerEdificio(Edificio):
    id: int
    status: int

    class Config:
        from_attributes = True
