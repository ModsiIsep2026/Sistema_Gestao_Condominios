from sqlalchemy import Column, Integer, String, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class Condomino(Base):
    __tablename__ = "condomino"

    id = Column(Integer, primary_key=True, autoincrement=True)

    nome = Column(String(100), nullable=False)

    email = Column(String(150), nullable=False, unique=True)

    pw = Column(String(255), nullable=False)

    telemovel = Column(String(150), nullable=False, unique=True)

    id_apartamento = Column(Integer, ForeignKey("apartamento.id"), nullable=False)

    status = Column(SmallInteger, nullable=False, default=1)

    apartamento = relationship("Apartamento", back_populates="condominos")
    alugueres_espaco = relationship("AluguerEspaco", back_populates="condomino")
    alugueres_material = relationship("AluguerMaterial", back_populates="condomino")
    avarias = relationship("RegistoAvaria", back_populates="condomino")
