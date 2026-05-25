from pydantic import BaseModel, EmailStr
from typing import Optional


class Condomino(BaseModel):
    nome: str
    email: EmailStr
    telemovel: str
    id_apartamento: int


class CriarCondomino(BaseModel):
    nome: str
    email: EmailStr
    id_apartamento: int
    telemovel: Optional[str] = None   # preenchido pelo condómino no perfil


class AtualizarCondomino(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telemovel: Optional[str] = None
    id_apartamento: Optional[int] = None
    status: Optional[int] = None


class LerCondomino(Condomino):
    id: int
    status: int

    class Config:
        from_attributes = True
