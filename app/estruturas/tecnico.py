from pydantic import BaseModel, EmailStr
from typing import Optional


class CriarTecnico(BaseModel):
    nome: str
    funcao: Optional[str] = None
    email: EmailStr



class AtualizarTecnico(BaseModel):
    nome: Optional[str] = None
    funcao: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[int] = None


class LerTecnico(BaseModel):
    id: int
    nome: str
    funcao: Optional[str] = None
    email: EmailStr
    id_gestor: int
    status: int

    class Config:
        from_attributes = True
