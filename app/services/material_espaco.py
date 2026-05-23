from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.material_espaco import MaterialEspaco


def listar_pespaco(db: Session, id_espaco: int):
    return db.query(MaterialEspaco).filter(MaterialEspaco.id_espaco == id_espaco).all()


def obter(db: Session, id: int):
    material = db.query(MaterialEspaco).filter(MaterialEspaco.id == id).first()
    
    if not material:
        raise HTTPException(404, "Material não encontrado")
    return material


def criar(db: Session, dados):
    material = MaterialEspaco(**dados.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


def atualizar(db: Session, id: int, dados):
    material = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():setattr(material, campo, valor)
    
    db.commit()
    db.refresh(material)
    return material


def remover(db: Session, id: int):
    material = obter(db, id)
    db.delete(material)
    db.commit()
    return {"detalhe": "Material removido"}
