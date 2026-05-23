from pydantic import BaseModel
from typing import Optional


class Espaco(BaseModel):
    nome: str
    id_edificio: int
    preco_hora: float = 0.0


class CriarEspaco(Espaco):
    pass


class AtualizarEspaco(BaseModel):
    nome: Optional[str] = None
    preco_hora: Optional[float] = None
    status: Optional[int] = None


class LerEspaco(Espaco):
    id: int
    status: int

    class Config:
        from_attributes = True
