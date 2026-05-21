from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Utilizador(Base):
    __tablename__ = "utilizador"

    id_utilizador = Column(Integer, primary_key=True, autoincrement=True)
    perfil_id = Column(Integer, ForeignKey("perfil.id_perfil"), nullable=False)
    nome = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    telemovel = Column(String(20))
    nif = Column(String(20))
    lingua = Column(String(5), nullable=False, default="pt")
    status = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    email_verificado = Column(Boolean, nullable=False, default=False)

    perfil = relationship("Perfil")
