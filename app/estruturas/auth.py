from pydantic import BaseModel, EmailStr
from typing import Literal, Optional


class Login(BaseModel):
    email: EmailStr
    pw: str
    perfil: Optional[Literal["admin", "gestor", "condomino", "tecnico"]] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    perfil_utilizador: Literal["admin", "gestor", "condomino", "tecnico"]
    id: int


class AlterarPassword(BaseModel):
    pw_atual: str
    pw_nova: str
