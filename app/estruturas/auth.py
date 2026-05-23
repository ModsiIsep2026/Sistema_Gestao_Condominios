from pydantic import BaseModel, EmailStr
from typing import Literal


class Login(BaseModel):
    email: EmailStr
    pw: str
    perfil: Literal["admin", "gestor", "condomino", "tecnico"] # o literal restringe o tipo apenas a estes valoes


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    perfil_utilizador: Literal["admin", "gestor", "condomino", "tecnico"]
    id: int


class AlterarPassword(BaseModel):
    pw_atual: str
    pw_nova: str
