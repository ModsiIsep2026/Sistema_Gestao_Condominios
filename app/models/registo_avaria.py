from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class RegistoAvaria(Base):
    __tablename__ = "registo_avaria"

    id = Column(Integer, primary_key=True, autoincrement=True)

    id_condomino = Column(Integer, ForeignKey("condomino.id"), nullable=False)

    zona = Column(String(100), nullable=False)

    descricao = Column(String(255), nullable=True)

    data_registo = Column(DateTime, nullable=False)

    id_edificio = Column(Integer, ForeignKey("edificio.id"), nullable=False)

    status = Column(SmallInteger, nullable=False, default=1)

    condomino = relationship("Condomino", back_populates="avarias")#fk
    edificio = relationship("Edificio", back_populates="avarias")
    resolucao = relationship("ResolucaoAvaria", back_populates="registo_avaria", uselist=False)
