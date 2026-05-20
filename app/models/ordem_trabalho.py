from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class OrdemTrabalho(Base):
    __tablename__ = "ordem_trabalho"

    id_ordem = Column(Integer, primary_key=True, autoincrement=True)
    avaria_id = Column(Integer, ForeignKey("avaria.id_avaria"), nullable=False)
    tecnico_id = Column(Integer, ForeignKey("utilizador.id_utilizador"))
    gestor_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("fornecedor.id_fornecedor"))
    estado_id = Column(Integer, ForeignKey("estado_ordem_trabalho.id_estado"), nullable=False)
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime)
    status = Column(Integer, nullable=False, default=1)

    avaria = relationship("Avaria")
    tecnico = relationship("Utilizador", foreign_keys=[tecnico_id])
    gestor = relationship("Utilizador", foreign_keys=[gestor_id])
    fornecedor = relationship("Fornecedor")
    estado = relationship("EstadoOrdemTrabalho")