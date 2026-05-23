from pydantic import BaseModel, EmailStr
from typing import Literal


class Login(BaseModel):
    email: EmailStr
    pw: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tipo_utilizador: Literal["admin", "gestor", "condomino", "tecnico"]
    id: int


class AlterarPassword(BaseModel):
    pw_atual: str
    pw_nova: str
