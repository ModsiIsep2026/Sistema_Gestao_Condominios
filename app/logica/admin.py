from sqlalchemy.orm import Session
from app.tabelas_bd.admin import Admin



def atualizar(db: Session, id: int, dados):
    admin = db.query(Admin).filter(Admin.id == id, Admin.status == 1).first()

    for campo, valor in dados.model_dump(exclude_unset=True).items():

        setattr(admin, campo, valor)
        
    db.commit()
    db.refresh(admin)
    return admin


