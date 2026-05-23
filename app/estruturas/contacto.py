from pydantic import BaseModel, EmailStr
from typing import Optional


class MensagemContacto(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    mensagem: str
