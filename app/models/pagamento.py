from datetime import datetime
from sqlalchemy import Column, Integer, DECIMAL, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Pagamento(Base):
    __tablename__ = "pagamento"

    id_pagamento = Column(Integer, primary_key=True, autoincrement=True)
    quota_id = Column(Integer, ForeignKey("quota.id_quota"), nullable=False)
    utilizador_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    valor_pago = Column(DECIMAL(10, 2), nullable=False)
    data_pagamento = Column(Date, nullable=False)
    status = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    quota = relationship("Quota")
    utilizador = relationship("Utilizador")
