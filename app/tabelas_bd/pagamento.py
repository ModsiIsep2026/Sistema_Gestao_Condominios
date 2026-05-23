from sqlalchemy import Column, Integer, String, Numeric, DateTime, SmallInteger, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class Pagamento(Base):
    __tablename__ = "pagamento"

    id = Column(Integer, primary_key=True, autoincrement=True)

    id_apartamento = Column(Integer, ForeignKey("apartamento.id"), nullable=False)

    
    mes = Column(String(7), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)

    # 1=ativo, 0=cancelado
    status = Column(SmallInteger, nullable=False, default=1) # 1- ativo  0- cancelado

    data_i = Column(DateTime, nullable=False)

    data_p = Column(DateTime, nullable=True)

    estado = Column(SmallInteger, nullable=False, default=0) # 1- pago 0 - pendente


    # Cada mês tem um único pagamento associado
    __table_args__ = (
        UniqueConstraint("id_apartamento", "mes", name="uq_pagamento"),
    )

    apartamento = relationship("Apartamento", back_populates="pagamentos")#fk
