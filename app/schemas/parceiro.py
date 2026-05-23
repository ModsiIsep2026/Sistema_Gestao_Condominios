from pydantic import BaseModel
from typing import Optional


class Parceiro(BaseModel):
    nome: str
    servico: Optional[str] = None
    localizacao: Optional[str] = None
    site: Optional[str] = None
    id_admin: int


class CriarParceiro(Parceiro):
    pass


class AtualizarParceiro(BaseModel):
    nome: Optional[str] = None
    servico: Optional[str] = None
    localizacao: Optional[str] = None
    site: Optional[str] = None
    status: Optional[int] = None


class LerParceiro(Parceiro):
    id: int
    status: int

    class Config:
        from_attributes = True
