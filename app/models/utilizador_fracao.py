from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class UtilizadorFracao(Base):
    __tablename__ = "utilizador_fracao"

    id_utilizador_fracao = Column(Integer, primary_key=True, autoincrement=True)
    utilizador_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    fracao_id = Column(Integer, ForeignKey("fracao.id_fracao"), nullable=False)
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date)
    status = Column(Integer, nullable=False, default=1)

    utilizador = relationship("Utilizador") # Tabela Utilizador, para obter o nome do utilizador associado à fração
    fracao = relationship("Fracao") # Tabela Fracao, para obter o código da fração associada ao utilizador