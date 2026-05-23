from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.aluguer_espaco import AluguerEspaco
from app.tabelas_bd.espaco import Espaco


def listar(db: Session):
    return db.query(AluguerEspaco).filter(AluguerEspaco.status == 1).all()


def listar_por_espaco(db: Session, id_espaco: int):
    return db.query(AluguerEspaco).filter(AluguerEspaco.id_espaco == id_espaco, AluguerEspaco.status == 1).all()


def listar_pcondomino(db: Session, id_condomino: int):
    return db.query(AluguerEspaco).filter(AluguerEspaco.id_condomino == id_condomino, AluguerEspaco.status == 1).all()


def criar(db: Session, dados, id_condomino: int):
    espaco = db.query(Espaco).filter(Espaco.id == dados.id_espaco, Espaco.status == 1).first()
    
    if not espaco:
        raise HTTPException(404, "Espaço não encontrado")

    horas = (dados.data_fim - dados.data_inicio).total_seconds() / 3600
    aluguer = AluguerEspaco(
        id_espaco=dados.id_espaco,
        id_condomino=id_condomino,
        data_inicio=dados.data_inicio,
        data_fim=dados.data_fim,
        preco_total=round(float(espaco.preco_hora) * horas, 2),
    )
    db.add(aluguer)
    db.commit()
    db.refresh(aluguer)
    return aluguer


def cancelar(db: Session, id: int):
    c = db.query(AluguerEspaco).filter(AluguerEspaco.id == id, AluguerEspaco.status == 1).first()
    if not c:
        raise HTTPException(404)
    c.status = 0
    db.commit()
    return {"detalhe": "Pedido de aluguer cancelado"}
