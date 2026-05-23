from pydantic import BaseModel, EmailStr
from typing import Optional


class Tecnico(BaseModel):
    nome: str
    funcao: Optional[str] = None
    email: EmailStr
    id_gestor: int


class CriarTecnico(Tecnico):
    pw: str


class AtualizarTecnico(BaseModel):
    nome: Optional[str] = None
    funcao: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[int] = None


class LerTecnico(Tecnico):
    id: int
    status: int

    class Config:
        from_attributes = True
