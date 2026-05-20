from sqlalchemy import Column, Integer, String
from app.core.db_connect import Base


class Fornecedor(Base):
    __tablename__ = "fornecedor"


    id_fornecedor = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(200), nullable=False)
    nif = Column(String(20))
    servico = Column(String(100))
    status = Column(Integer, nullable=False, default=1)