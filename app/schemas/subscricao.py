from pydantic import BaseModel, EmailStr
from typing import Optional


class IniciarRegisto(BaseModel):
    nome: str
    email: EmailStr
    telemovel: Optional[str] = None
    nif: Optional[str] = None


class ConcluirPagamento(BaseModel):
    payment_intent_id: str
    nome: str
    email: EmailStr
    telemovel: Optional[str] = None
    nif: Optional[str] = None


class RespostaInicio(BaseModel):
    client_secret: str
    publishable_key: str
    preco_centimos: int
