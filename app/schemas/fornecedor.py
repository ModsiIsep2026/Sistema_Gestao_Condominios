from pydantic import BaseModel
from typing import Optional


class FornecedorBase(BaseModel):
    nome: str
    servico: Optional[str] = None
    site: Optional[str] = None
    preco_hora: Optional[float] = None


class CriarFornecedor(FornecedorBase):
    pass


class AtualizarFornecedor(BaseModel):
    nome: Optional[str] = None
    servico: Optional[str] = None
    site: Optional[str] = None
    preco_hora: Optional[float] = None
    status: Optional[int] = None


class LerFornecedor(FornecedorBase):
    id_fornecedor: int
    status: int

    class Config:
        from_attributes = True
