from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Notificacao(Base):
    __tablename__ = "notificacao"

    id_notificacao = Column(Integer, primary_key=True, autoincrement=True)
    utilizador_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    titulo = Column(String(200), nullable=False)
    mensagem = Column(Text, nullable=False)
    lida = Column(Integer, nullable=False, default=0)
    status = Column(Integer, nullable=False, default=1)

    utilizador = relationship("Utilizador")