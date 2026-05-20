from sqlalchemy import Column, Integer, String
from app.core.db_connect import Base


class CategoriaDespesa(Base):
    __tablename__ = "categoria_despesa"

    id_categoria = Column(Integer, primary_key=True, autoincrement=True)
    nome_pt = Column(String(50), nullable=False)
    nome_en = Column(String(50), nullable=False)