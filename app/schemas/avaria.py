from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CriarAvaria(BaseModel):
    utilizador_id: int
    edificio_id: int
    fracao_id: Optional[int] = None
    categoria_id: int
    descricao: str


class AtualizarAvaria(BaseModel):
    categoria_id: Optional[int] = None
    descricao: Optional[str] = None
    status: Optional[int] = None


class LerAvaria(BaseModel):
    id_avaria: int
    utilizador_id: int
    edificio_id: int
    fracao_id: Optional[int] = None
    categoria_id: int
    descricao: str
    status: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
