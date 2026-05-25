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


class LerAptResumo(BaseModel):
    id: int
    fracao: str
    andar: Optional[int] = None
    id_edificio: int

    class Config:
        from_attributes = True


class LerEdificioResumo(BaseModel):
    id: int
    rua: str
    cidade: Optional[str] = None

    class Config:
        from_attributes = True


class LerCondomino(Condomino):
    id: int
    status: int
    apartamento: Optional[LerAptResumo] = None

    class Config:
        from_attributes = True
