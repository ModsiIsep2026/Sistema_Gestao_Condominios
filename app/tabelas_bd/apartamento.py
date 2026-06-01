from sqlalchemy import Column, Integer, String, SmallInteger, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class Apartamento(Base):
    __tablename__ = "apartamento"

    id = Column(Integer, primary_key=True, autoincrement=True)

    fracao = Column(String(20), nullable=False)

    andar = Column(SmallInteger, nullable=True)

    id_edificio = Column(Integer, ForeignKey("edificio.id"), nullable=False)

    permilagem = Column(Numeric(6, 2), nullable=False)

    status = Column(SmallInteger, nullable=False, default=1)

    edificio = relationship("Edificio", back_populates="apartamentos")
    condominos = relationship("Condomino", back_populates="apartamento")
    pagamentos = relationship("Pagamento", back_populates="apartamento")

    def calcular_quota_mensal(self) -> float:
        valor_base = self.edificio.valor_base_mensal if self.edificio else 0
        return float(valor_base) * float(self.permilagem) / 1000