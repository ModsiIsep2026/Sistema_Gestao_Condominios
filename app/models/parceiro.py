from sqlalchemy import Column, Integer, String, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Parceiro(Base):
    __tablename__ = "parceiro"

    id = Column(Integer, primary_key=True, autoincrement=True)

    nome = Column(String(100), nullable=False)

    servico = Column(String(100), nullable=True)

    localizacao = Column(String(100), nullable=True)

    status = Column(SmallInteger, nullable=False, default=1)

    id_admin = Column(Integer, ForeignKey("admin.id"), nullable=False) # Qual admin fechou com este parceiro

    site = Column(String(255), nullable=True)

    admin = relationship("Admin")#fk
