from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class Gestor(BaseModel):
    nome: str
    empresa: Optional[str] = None
    telemovel: str
    email: EmailStr


class CriarGestor(Gestor):
    pw: str


class AtualizarGestorPerfil(BaseModel):
    nome: Optional[str] = None
    empresa: Optional[str] = None
    telemovel: Optional[str] = None
    email: Optional[EmailStr] = None


class AtualizarGestor(AtualizarGestorPerfil):
    status: Optional[int] = None


class LerGestor(Gestor):
    id: int
    status: int
    data_fim: Optional[date] = None   # data de fim do contrato

    class Config:
        from_attributes = True
