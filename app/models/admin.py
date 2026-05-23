from sqlalchemy import Column, Integer, String, SmallInteger
from app.core.db_connect import Base


class Admin(Base):
    __tablename__ = "admin"

    id = Column(Integer, primary_key=True, autoincrement=True)

    nome = Column(String(150), nullable=False)

    email = Column(String(150), nullable=False, unique=True)

    pw = Column(String(255), nullable=False)

    status = Column(SmallInteger, nullable=False, default=1)
