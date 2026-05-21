from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


def _validar_pw_forte(v: str) -> str:
    if len(v) < 8:
        raise ValueError("A password tem de ter pelo menos 8 caracteres.")
    if not any(c.isupper() for c in v):
        raise ValueError("A password tem de ter pelo menos uma letra maiúscula.")
    if not any(c.isdigit() for c in v):
        raise ValueError("A password tem de ter pelo menos um número.")
    return v


class Login(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class Registo(BaseModel):
    nome: str
    email: EmailStr
    password: str
    telemovel: Optional[str] = None
    nif: Optional[str] = None
    lingua: str = "pt"

    _v_pw = field_validator("password")(lambda cls, v: _validar_pw_forte(v))

    @field_validator("nome")
    @classmethod
    def nome_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Indique o seu nome completo.")
        return v


class EPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    password: str

    _v_pw = field_validator("password")(lambda cls, v: _validar_pw_forte(v))
