from pydantic import BaseModel
from typing import Optional


class CriarNotificacao(BaseModel):
    utilizador_id: int
    titulo: str
    mensagem: str
    tipo: Optional[str] = None
    referencia_id: Optional[int] = None


class AtualizarNotificacao(BaseModel):
    lida: Optional[int] = None
    status: Optional[int] = None


class LerNotificacao(BaseModel):
    id_notificacao: int
    utilizador_id: int
    titulo: str
    mensagem: str
    lida: int
    status: int
    tipo: Optional[str] = None
    referencia_id: Optional[int] = None

    class Config:
        from_attributes = True
