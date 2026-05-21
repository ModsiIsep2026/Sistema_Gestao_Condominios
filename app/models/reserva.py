from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Reserva(Base):
    __tablename__ = "reserva"

    id_reserva = Column(Integer, primary_key=True, autoincrement=True)
    utilizador_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    espaco_id = Column(Integer, ForeignKey("espaco_comum.id_espaco"), nullable=False)
    aprovador_id = Column(Integer, ForeignKey("utilizador.id_utilizador"))
    estado_id = Column(Integer, ForeignKey("estado_reserva.id_estado"), nullable=False)
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, nullable=False)
    status = Column(Integer, nullable=False, default=1)
    data_aprovacao = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    utilizador = relationship("Utilizador", foreign_keys=[utilizador_id])
    aprovador = relationship("Utilizador", foreign_keys=[aprovador_id])
    espaco = relationship("EspacoComum")
    estado = relationship("EstadoReserva")
