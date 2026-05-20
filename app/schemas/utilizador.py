from pydantic import BaseModel, EmailStr
from typing import Optional


class UtilizadorBase(BaseModel):
    perfil_id: int
    nome: str
    email: EmailStr
    telemovel: Optional[str] = None
    nif: Optional[str] = None
    lingua: str = "pt"


class CriarUtilizador(UtilizadorBase):
    password: str


class AtualizarUtilizador(BaseModel):
    perfil_id: Optional[int] = None
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telemovel: Optional[str] = None
    nif: Optional[str] = None
    lingua: Optional[str] = None
    status: Optional[int] = None


class LerUtilizador(UtilizadorBase):
    id_utilizador: int
    status: int

    class Config:
        from_attributes = True