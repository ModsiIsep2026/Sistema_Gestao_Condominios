from sqlalchemy import Column, Integer, String, Text
from app.core.db_connect import Base


class Perfil(Base):
    __tablename__ = "perfil"

    id_perfil = Column(Integer, primary_key=True, autoincrement=True) #
    nome = Column(String(50), nullable=False) # Nome do perfil (ex: "Administrador", "Gestor", "Técnico", "Morador") 
    descricao = Column(Text) 
    status = Column(Integer, nullable=False, default=1)