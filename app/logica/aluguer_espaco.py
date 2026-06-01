from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.tabelas_bd.aluguer_espaco import AluguerEspaco
from app.tabelas_bd.espaco import Espaco


def listar(db: Session):
    return db.query(AluguerEspaco).filter(AluguerEspaco.status == 1).all()


def listar_pespaco(db: Session, id_espaco: int):
    return db.query(AluguerEspaco).filter(AluguerEspaco.id_espaco == id_espaco, AluguerEspaco.status == 1).all()


def listar_pcondomino(db: Session, id_condomino: int):
    return db.query(AluguerEspaco).filter(AluguerEspaco.id_condomino == id_condomino, AluguerEspaco.status == 1).all()


def criar(db: Session, dados, condomino):

    espaco = db.query(Espaco).filter(Espaco.id == dados.id_espaco, Espaco.status == 1).first()

    if not espaco:
        raise HTTPException(404, "Espaço não encontrado")

    id_edificio_condomino = condomino.apartamento.id_edificio if condomino.apartamento else None

    if id_edificio_condomino is None or espaco.id_edificio != id_edificio_condomino:
        raise HTTPException(403, "Só pode reservar espaços do seu edifício")

    reserva_existente = (
        db.query(AluguerEspaco)
        .filter(
            AluguerEspaco.id_espaco == dados.id_espaco,
            AluguerEspaco.status == 1,
            AluguerEspaco.data_inicio < dados.data_fim,
            AluguerEspaco.data_fim > dados.data_inicio,
        )
        .first()
    )
    if reserva_existente:
        raise HTTPException(400, "Já existe uma reserva nesse período")

    horas = max((dados.data_fim - dados.data_inicio).total_seconds() / 3600, 1)
    aluguer = AluguerEspaco(
        id_espaco=dados.id_espaco,
        id_condomino=condomino.id,
        data_inicio=dados.data_inicio,
        data_fim=dados.data_fim,
        preco_total=round(float(espaco.preco_hora) * horas, 2),
    )
    db.add(aluguer) # adiciona info na bd
    db.commit() # guarda as alterações na bd
    db.refresh(aluguer) #atualiza na bd
    return aluguer


def cancelar(db: Session, id: int):
    c = db.query(AluguerEspaco).filter(AluguerEspaco.id == id, AluguerEspaco.status == 1).first()
    if not c:
        raise HTTPException(404, "Reserva não encontrada")
    c.status = 0
    db.commit()
    return {"detalhe": "Pedido de aluguer cancelado"}
