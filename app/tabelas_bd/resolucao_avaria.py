from sqlalchemy import Column, Integer, DateTime, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class ResolucaoAvaria(Base):
    __tablename__ = "resolucao_avaria"

    id = Column(Integer, primary_key=True, autoincrement=True)

    id_registo_avaria = Column(Integer, ForeignKey("registo_avaria.id"), nullable=False)

    id_tecnico = Column(Integer, ForeignKey("tecnico.id"), nullable=False)

    status = Column(SmallInteger, nullable=False, default=0) # 1- resolvida 0- pendente

    data_resolucao = Column(DateTime, nullable=True)

    registo_avaria = relationship("RegistoAvaria", back_populates="resolucao")#fk
    tecnico = relationship("Tecnico", back_populates="resolucoes")
