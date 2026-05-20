from sqlalchemy import Column, Integer, String
from app.core.db_connect import Base


class EstadoReserva(Base):
    __tablename__ = "estado_reserva"

    id_estado = Column(Integer, primary_key=True, autoincrement=True)
    nome_pt = Column(String(50), nullable=False) 
    nome_en = Column(String(50), nullable=False)