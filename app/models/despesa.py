from sqlalchemy import Column, Integer, DECIMAL, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db_connect import Base


class Despesa(Base):
    __tablename__ = "despesa"

    id_despesa = Column(Integer, primary_key=True, autoincrement=True)
    edificio_id = Column(Integer, ForeignKey("edificio.id_edificio"), nullable=False)
    gestor_id = Column(Integer, ForeignKey("utilizador.id_utilizador"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("fornecedor.id_fornecedor"))
    categoria_id = Column(Integer, ForeignKey("categoria_despesa.id_categoria"), nullable=False)
    valor = Column(DECIMAL(10, 2), nullable=False)
    data_despesa = Column(Date, nullable=False)
    status = Column(Integer, nullable=False, default=1)

    edificio = relationship("Edificio") # Tabela Edificio, para obter o nome do edificio onde ocorreu a despesa
    gestor = relationship("Utilizador") # Tabela Utilizador, para obter o nome do gestor que registou a despesa
    fornecedor = relationship("Fornecedor") # Tabela Fornecedor, para obter o nome do fornecedor associado à despesa
    categoria = relationship("CategoriaDespesa") # Tabela CategoriaDespesa, para obter o nome da categoria da despesa