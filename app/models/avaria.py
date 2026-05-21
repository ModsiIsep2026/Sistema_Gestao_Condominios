from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Avaria(Base):
    __tablename__ = "avaria"

    id_avaria = Column(Integer, primary_key=True, autoincrement=True)
    utilizador_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    edificio_id = Column(Integer, ForeignKey("edificio.id_edificio"), nullable=False)
    fracao_id = Column(Integer, ForeignKey("fracao.id_fracao"))
    categoria_id = Column(Integer, ForeignKey("categoria_avaria.id_categoria"), nullable=False)
    descricao = Column(Text, nullable=False)
    status = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    utilizador = relationship("Utilizador")
    edificio = relationship("Edificio")
    fracao = relationship("Fracao")
    categoria = relationship("CategoriaAvaria")
