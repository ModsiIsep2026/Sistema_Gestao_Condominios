from sqlalchemy import Column, Integer, Date, SmallInteger, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.configs.db_connect import Base


class Contrato(Base):
    __tablename__ = "contrato"

    id = Column(Integer, primary_key=True, autoincrement=True)

    id_licenca = Column(Integer, ForeignKey("licenca.id"), nullable=False)

    id_gestor = Column(Integer, ForeignKey("gestor.id"), nullable=False)

    status = Column(SmallInteger, nullable=False, default=1)

    data_inicio = Column(Date, nullable=False)

    data_fim = Column(Date, nullable=False)

    __table_args__ = (
        UniqueConstraint("id_licenca", "id_gestor", name="uq_licenca_gestor"),
    )

    licenca = relationship("Licenca")
    gestor = relationship("Gestor", back_populates="contrato")
