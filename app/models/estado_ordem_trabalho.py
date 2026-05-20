from sqlalchemy import Column, Integer, String
from app.core.db_connect import Base


class EstadoOrdemTrabalho(Base):
    __tablename__ = "estado_ordem_trabalho"

    id_estado = Column(Integer, primary_key=True, autoincrement=True)
    nome_pt = Column(String(50), nullable=False)
    nome_en = Column(String(50), nullable=False)