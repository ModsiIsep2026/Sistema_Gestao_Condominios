from sqlalchemy import Column, Integer, String, Numeric
from app.core.db_connect import Base


class Fornecedor(Base):
    __tablename__ = "fornecedor"


    id_fornecedor = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(200), nullable=False)
    servico = Column(String(100))
    localizacao = Column(String(255), nullable=True)
    site = Column(String(255), nullable=True)
    preco_hora = Column(Numeric(8, 2), nullable=True)
    status = Column(Integer, nullable=False, default=1)
