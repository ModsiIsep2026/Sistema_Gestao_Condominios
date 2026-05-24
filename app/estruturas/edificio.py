from pydantic import BaseModel
from typing import Optional


# Usado apenas para leitura (inclui id_gestor que vem da BD)
class LerEdificio(BaseModel):
    id: int
    rua: str
    cp: Optional[str] = None
    cidade: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    iban: Optional[str] = None
    valor_base_mensal: Optional[float] = None
    id_gestor: int
    status: int

    class Config:
        from_attributes = True



class CriarEdificio(BaseModel):
    rua: str
    cp: Optional[str] = None
    cidade: Optional[str] = None
    lat: float
    lng: float
    iban: Optional[str] = None
    valor_base_mensal: Optional[float] = None


class AtualizarEdificio(BaseModel):
    rua: Optional[str] = None
    cp: Optional[str] = None
    cidade: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    iban: Optional[str] = None
    valor_base_mensal: Optional[float] = None
    status: Optional[int] = None
