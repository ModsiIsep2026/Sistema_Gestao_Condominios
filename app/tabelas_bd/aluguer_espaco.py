from sqlalchemy import Column, Integer, Numeric, DateTime, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class AluguerEspaco(Base):
    __tablename__ = "aluguer_espaco"

    id = Column(Integer, primary_key=True, autoincrement=True)

    id_espaco = Column(Integer, ForeignKey("espaco.id"), nullable=False)

    id_condomino = Column(Integer, ForeignKey("condomino.id"), nullable=False)

    data_inicio = Column(DateTime, nullable=False)

    data_fim = Column(DateTime, nullable=False)

    preco_total = Column(Numeric(10, 2), nullable=False, default=0.00)

    status = Column(SmallInteger, nullable=False, default=1)

    espaco = relationship("Espaco", back_populates="alugueres")
    condomino = relationship("Condomino", back_populates="alugueres_espaco")
