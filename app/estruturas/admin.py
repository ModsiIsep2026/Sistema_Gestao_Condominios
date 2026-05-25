from pydantic import BaseModel, EmailStr
from typing import Optional


class LerAdmin(BaseModel):
    id: int
    nome: str
    email: EmailStr
    status: int

    class Config:
        from_attributes = True


class AtualizarAdmin(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[int] = None