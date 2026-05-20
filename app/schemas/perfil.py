from pydantic import BaseModel
from typing import Optional


class LerPerfil(BaseModel):
    id_perfil: int
    nome: str
    descricao: Optional[str] = None
    status: int

    class Config:
        from_attributes = True


