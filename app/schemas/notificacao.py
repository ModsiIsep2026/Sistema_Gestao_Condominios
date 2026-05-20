from pydantic import BaseModel


class LerNotificacao(BaseModel):
    id_notificacao: int
    utilizador_id: int
    titulo: str
    mensagem: str
    lida: int
    status: int

    class Config:
        from_attributes = True 