from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class EspacoComum(Base):
    __tablename__ = "espaco_comum"

    id_espaco = Column(Integer, primary_key=True, autoincrement=True)
    edificio_id = Column(Integer, ForeignKey("edificio.id_edificio"), nullable=False)
    nome = Column(String(100), nullable=False)
    capacidade = Column(Integer)
    status = Column(Integer, nullable=False, default=1)

    edificio = relationship("Edificio") # Tabela Edificio, para obter o nome do edificio onde se encontra o espaço comum