from sqlalchemy import Column, Integer, String, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class Tecnico(Base):
    __tablename__ = "tecnico"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    nome = Column(String(100), nullable=False)

    funcao = Column(String(50), nullable=True)

    email = Column(String(150), nullable=False, unique=True)

    pw = Column(String(255), nullable=False)

    id_gestor = Column(Integer, ForeignKey("gestor.id"), nullable=False)
    
    status = Column(SmallInteger, nullable=False, default=1)

    gestor = relationship("Gestor", back_populates="tecnicos") #fk
    resolucoes = relationship("ResolucaoAvaria", back_populates="tecnico")
