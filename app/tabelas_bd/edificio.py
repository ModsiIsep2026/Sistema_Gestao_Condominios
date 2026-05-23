from sqlalchemy import Column, Integer, String, Numeric, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class Edificio(Base):
    __tablename__ = "edificio"

    id = Column(Integer, primary_key=True, autoincrement=True)

    rua = Column(String(100), nullable=False)

    cp = Column(String(100), nullable=False)

    cidade = Column(String(80), nullable=True)

    lat = Column(Numeric(10, 7), nullable=False)

    lng = Column(Numeric(10, 7), nullable=False)

    iban = Column(String(100), nullable=False, unique=True)

    valor_base_mensal = Column(Numeric(10, 2), nullable=False) # A definir pelo gestor

    id_gestor = Column(Integer, ForeignKey("gestor.id"), nullable=False)

    status = Column(SmallInteger, nullable=False, default=1)

    gestor = relationship("Gestor", back_populates="edificios")#fk
    apartamentos = relationship("Apartamento", back_populates="edificio")
    espacos = relationship("Espaco", back_populates="edificio")
    avarias = relationship("RegistoAvaria", back_populates="edificio")
