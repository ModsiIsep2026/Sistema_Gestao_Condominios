from sqlalchemy import Column, Integer, String
from app.core.db_connect import Base


class Edificio(Base):
    __tablename__ = "edificio"


    id_edificio = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(200), nullable=False)
    morada = Column(String(255), nullable=False)
    codigo_postal = Column(String(10)) 
    cidade = Column(String(100))
    status = Column(Integer, nullable=False, default=1)