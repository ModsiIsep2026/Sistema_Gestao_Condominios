from sqlalchemy import Column, Integer, String, Numeric, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Espaco(Base):
    __tablename__ = "espaco"

    id = Column(Integer, primary_key=True, autoincrement=True)

    nome = Column(String(100), nullable=False)

    id_edificio = Column(Integer, ForeignKey("edificio.id"), nullable=False)

    preco_hora = Column(Numeric(10, 2), nullable=False, default=0.00)

    status = Column(SmallInteger, nullable=False, default=1)

    edificio = relationship("Edificio", back_populates="espacos") #fk
    materiais = relationship("MaterialEspaco", back_populates="espaco")
    alugueres = relationship("AluguerEspaco", back_populates="espaco")
