from pydantic import BaseModel
from typing import Optional


class MaterialEspaco(BaseModel):
    material: str
    qtd: int = 0
    preco_unitario: float = 0.0
    id_espaco: int


class CriarMaterialEspaco(MaterialEspaco):
    pass


class AtualizarMaterialEspaco(BaseModel):
    material: Optional[str] = None
    qtd: Optional[int] = None
    preco_unitario: Optional[float] = None


class LerMaterialEspaco(MaterialEspaco):
    id: int

    class Config:
        from_attributes = True
