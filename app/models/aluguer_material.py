from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class AluguerMaterial(Base):
    __tablename__ = "aluguer_material"

    id = Column(Integer, primary_key=True, autoincrement=True)

    id_material_espaco = Column(Integer, ForeignKey("material_espaco.id"), nullable=False)

    qtd_alugada = Column(Integer, nullable=False, default=1)

    data_inicio = Column(DateTime, nullable=False)

    data_fim = Column(DateTime, nullable=False)

    id_condomino = Column(Integer, ForeignKey("condomino.id"), nullable=False)

    preco_total = Column(Numeric(10, 2), nullable=False, default=0.00)

    material_espaco = relationship("MaterialEspaco", back_populates="alugueres") #fk
    condomino = relationship("Condomino", back_populates="alugueres_material")
