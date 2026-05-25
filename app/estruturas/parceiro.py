from pydantic import BaseModel
from typing import Optional


class BaseParceiro(BaseModel):
    nome: str
    servico: Optional[str] = None
    localizacao: Optional[str] = None
    site: Optional[str] = None


class CriarParceiro(BaseParceiro):
    pass


class AtualizarParceiro(BaseModel):
    nome: Optional[str] = None
    servico: Optional[str] = None
    localizacao: Optional[str] = None
    site: Optional[str] = None
    status: Optional[int] = None


class LerParceiro(BaseParceiro):
    id: int
    id_admin: int
    status: int

    class Config:
        from_attributes = True
