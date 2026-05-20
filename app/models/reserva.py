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

    utilizador = relationship("Utilizador", foreign_keys=[utilizador_id]) # Tabela Utilizador, para obter o nome do utilizador que fez a reserva
    aprovador = relationship("Utilizador", foreign_keys=[aprovador_id]) # Tabela Utilizador, para obter o nome do aprovador da reserva
    espaco = relationship("EspacoComum") # Tabela EspacoComum, para obter o nome do espaço comum reservado
    estado = relationship("EstadoReserva") # Tabela EstadoReserva, para obter o nome do estado da reserva (Pendente,Aprovada,Rejeitada)