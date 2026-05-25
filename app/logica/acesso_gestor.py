from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.tabelas_bd.apartamento import Apartamento
from app.tabelas_bd.condomino import Condomino
from app.tabelas_bd.edificio import Edificio
from app.tabelas_bd.espaco import Espaco
from app.tabelas_bd.pagamento import Pagamento
from app.tabelas_bd.registo_avaria import RegistoAvaria


SEM_PERMISSAO = HTTPException(403, "Sem permissão para aceder a este recurso")


def obter_edificio(db: Session, id_edificio: int, id_gestor: int):
    edificio = (db.query(Edificio).filter(
            Edificio.id == id_edificio,
            Edificio.id_gestor == id_gestor,
            Edificio.status == 1,
        )
        .first()
    )
    if not edificio:
        raise SEM_PERMISSAO
    return edificio


def obter_apartamento(db: Session, id_apartamento: int, id_gestor: int):
    apartamento = (db.query(Apartamento)
        .join(Edificio, Apartamento.id_edificio == Edificio.id)
        .filter(
            Apartamento.id == id_apartamento,
            Apartamento.status == 1,
            Edificio.id_gestor == id_gestor,
            Edificio.status == 1,
        )
        .first()
    )
    if not apartamento:
        raise SEM_PERMISSAO
    return apartamento


def obter_condomino(db: Session, id_condomino: int, id_gestor: int):
    condomino = (db.query(Condomino).join(Apartamento, Condomino.id_apartamento == Apartamento.id)
        .join(Edificio, Apartamento.id_edificio == Edificio.id)
        .filter(
            Condomino.id == id_condomino,
            Condomino.status == 1,
            Apartamento.status == 1,
            Edificio.id_gestor == id_gestor,
            Edificio.status == 1,
        )
        .first()
    )
    if not condomino:
        raise SEM_PERMISSAO
    return condomino


def obter_espaco(db: Session, id_espaco: int, id_gestor: int):
    espaco = (
        db.query(Espaco)
        .join(Edificio, Espaco.id_edificio == Edificio.id)
        .filter(
            Espaco.id == id_espaco,
            Espaco.status == 1,
            Edificio.id_gestor == id_gestor,
            Edificio.status == 1,
        )
        .first()
    )
    if not espaco:
        raise SEM_PERMISSAO
    return espaco


def obter_pagamento(db: Session, id_pagamento: int, id_gestor: int):
    pagamento = (
        db.query(Pagamento)
        .join(Apartamento, Pagamento.id_apartamento == Apartamento.id)
        .join(Edificio, Apartamento.id_edificio == Edificio.id)
        .filter(
            Pagamento.id == id_pagamento,
            Pagamento.status == 1,
            Apartamento.status == 1,
            Edificio.id_gestor == id_gestor,
            Edificio.status == 1,
        )
        .first()
    )
    if not pagamento:
        raise SEM_PERMISSAO
    return pagamento


def obter_avaria(db: Session, id_avaria: int, id_gestor: int):
    avaria = (
        db.query(RegistoAvaria)
        .join(Edificio, RegistoAvaria.id_edificio == Edificio.id)
        .filter(
            RegistoAvaria.id == id_avaria,
            RegistoAvaria.status == 1,
            Edificio.id_gestor == id_gestor,
            Edificio.status == 1,
        )
        .first()
    )
    if not avaria:
        raise SEM_PERMISSAO
    return avaria
