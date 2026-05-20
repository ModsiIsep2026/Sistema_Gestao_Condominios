from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Fracao(Base):
    __tablename__ = "fracao"

    id_fracao = Column(Integer, primary_key=True, autoincrement=True)
    edificio_id = Column(Integer, ForeignKey("edificio.id_edificio"), nullable=False)
    codigo_fracao = Column(String(20), nullable=False)
    andar = Column(String(10))
    area_m2 = Column(DECIMAL(8, 2))
    status = Column(Integer, nullable=False, default=1)

    edificio = relationship("Edificio") # Tabela Edificio, para obter o nome do edificio onde se encontra a fração