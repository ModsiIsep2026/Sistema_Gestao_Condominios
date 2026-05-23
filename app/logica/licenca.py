from sqlalchemy.orm import Session
from app.tabelas_bd.licenca import Licenca


def listar(db: Session):
    return db.query(Licenca).filter(Licenca.status == 1).all()
