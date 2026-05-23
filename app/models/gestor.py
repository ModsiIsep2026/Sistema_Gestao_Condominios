from sqlalchemy import Column, Integer, String, SmallInteger
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Gestor(Base):
    __tablename__ = "gestor"

    id = Column(Integer, primary_key=True, autoincrement=True)

    nome = Column(String(100), nullable=False)

    empresa = Column(String(100), nullable=True)

    telemovel = Column(String(20), nullable=False, unique=True)

    email = Column(String(150), nullable=False, unique=True)

    pw = Column(String(255), nullable=False)

    status = Column(SmallInteger, nullable=False, default=1)

    contrato = relationship("Contrato", back_populates="gestor", uselist=False) # Cada gestor tem um único contrato
    edificios = relationship("Edificio", back_populates="gestor")
    tecnicos = relationship("Tecnico", back_populates="gestor")
