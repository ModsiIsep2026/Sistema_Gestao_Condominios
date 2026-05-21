from datetime import date
from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class GestorEdificio(Base):
    __tablename__ = "gestor_edificio"

    id_gestor_edificio = Column(Integer, primary_key=True, autoincrement=True)
    gestor_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    edificio_id = Column(Integer, ForeignKey("edificio.id_edificio"), nullable=False)
    data_inicio = Column(Date, nullable=False, default=date.today)
    data_fim = Column(Date, nullable=True)
    status = Column(Integer, nullable=False, default=1)

    gestor = relationship("Utilizador")
    edificio = relationship("Edificio")
