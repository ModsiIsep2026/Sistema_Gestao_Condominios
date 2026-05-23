from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class MaterialEspaco(Base):
    __tablename__ = "material_espaco"

    id = Column(Integer, primary_key=True, autoincrement=True)

    material = Column(String(100), nullable=False)

    qtd = Column(Integer, nullable=False, default=0)

    preco_unitario = Column(Numeric(10, 2), nullable=False, default=0.00)

    id_espaco = Column(Integer, ForeignKey("espaco.id"), nullable=False)

    espaco = relationship("Espaco", back_populates="materiais")#fk
    alugueres = relationship("AluguerMaterial", back_populates="material_espaco")
