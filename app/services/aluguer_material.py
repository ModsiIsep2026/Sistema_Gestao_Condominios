from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.aluguer_material import AluguerMaterial
from app.models.material_espaco import MaterialEspaco


def listar(db: Session):
    return db.query(AluguerMaterial).all()


def listar_pcondomino(db: Session, id_condomino: int):
    return db.query(AluguerMaterial).filter(AluguerMaterial.id_condomino == id_condomino).all()


def criar(db: Session, dados, id_condomino: int):
    material = db.query(MaterialEspaco).filter(MaterialEspaco.id == dados.id_material_espaco).first()

    if not material:
        raise HTTPException(404, "Material não encontrado")
    
    if material.qtd < dados.qtd_alugada:
        raise HTTPException(400, f"Quantidade disponível insuficiente ({material.qtd})")

    horas = (dados.data_fim - dados.data_inicio).total_seconds() / 3600
    
    aluguer = AluguerMaterial(
        id_material_espaco=dados.id_material_espaco,
        id_condomino=id_condomino,
        qtd_alugada=dados.qtd_alugada,
        data_inicio=dados.data_inicio,
        data_fim=dados.data_fim,
        preco_total=round(float(material.preco_unitario) * dados.qtd_alugada * horas, 2),
    )
    db.add(aluguer)
    db.commit()
    db.refresh(aluguer)
    return aluguer
