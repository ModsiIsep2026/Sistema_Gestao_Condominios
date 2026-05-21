from datetime import datetime
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


class CriarUtilizadorPorAdmin(UtilizadorBase):
    pass


class AtualizarUtilizador(BaseModel):
    perfil_id: Optional[int] = None
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telemovel: Optional[str] = None
    nif: Optional[str] = None
    lingua: Optional[str] = None
    status: Optional[int] = None
    email_verificado: Optional[bool] = None


class LerUtilizador(UtilizadorBase):
    id_utilizador: int
    status: int
    created_at: Optional[datetime] = None
    email_verificado: bool = False

    class Config:
        from_attributes = True
