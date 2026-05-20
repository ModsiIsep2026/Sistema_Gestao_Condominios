from pydantic import BaseModel
from typing import Optional


class FornecedorBase(BaseModel):
    nome: str
    nif: Optional[str] = None
    servico: Optional[str] = None


class CriarFornecedor(FornecedorBase):
    pass


class AtualizarFornecedor(BaseModel):
    nome: Optional[str] = None
    nif: Optional[str] = None
    servico: Optional[str] = None
    status: Optional[int] = None


class LerFornecedor(FornecedorBase):
    id_fornecedor: int
    status: int

    class Config:
        from_attributes = True