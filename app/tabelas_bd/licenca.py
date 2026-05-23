from sqlalchemy import Column, Integer, Numeric, SmallInteger
from app.configs.db_connect import Base


class Licenca(Base):
    __tablename__ = "licenca"

    id = Column(Integer, primary_key=True, autoincrement=True)

    num_edificios = Column(Integer, nullable=False)

    ppem = Column(Numeric(10, 2), nullable=False) # preco mensal p/edificio
    
    status = Column(SmallInteger, nullable=False, default=1)
