from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class LogAcesso(Base):
    __tablename__ = "log_acesso"


    id_log = Column(Integer, primary_key=True, autoincrement=True)
    utilizador_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    acao = Column(String(50), nullable=False)
    timestamp = Column(DateTime, nullable=False)

    utilizador = relationship("Utilizador")