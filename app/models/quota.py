from sqlalchemy import Column, Integer, DECIMAL, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Quota(Base):
    __tablename__ = "quota"

    id_quota = Column(Integer, primary_key=True, autoincrement=True)
    fracao_id = Column(Integer, ForeignKey("fracao.id_fracao"), nullable=False)
    valor = Column(DECIMAL(10, 2), nullable=False)
    mes_referencia = Column(Date, nullable=False)
    status = Column(Integer, nullable=False, default=1)

    fracao = relationship("Fracao")