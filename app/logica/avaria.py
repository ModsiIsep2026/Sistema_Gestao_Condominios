from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.tabelas_bd.registo_avaria import RegistoAvaria
from app.tabelas_bd.resolucao_avaria import ResolucaoAvaria


def _com_resolucao():
    return joinedload(RegistoAvaria.resolucao).joinedload(ResolucaoAvaria.tecnico)


def listar_ptecnico(db: Session, id_tecnico: int):
    resolucoes = db.query(ResolucaoAvaria).filter(ResolucaoAvaria.id_tecnico == id_tecnico).all()
    ids = [r.id_registo_avaria for r in resolucoes]
    return (
        db.query(RegistoAvaria)
        .options(_com_resolucao())
        .filter(RegistoAvaria.id.in_(ids), RegistoAvaria.status == 1)
        .all()
    )


def listar_pcondomino(db: Session, id_condomino: int):
    return (
        db.query(RegistoAvaria)
        .options(_com_resolucao())
        .filter(RegistoAvaria.id_condomino == id_condomino, RegistoAvaria.status == 1)
        .all()
    )


def listar_pedificio(db: Session, id_edificio: int):
    return (
        db.query(RegistoAvaria)
        .options(_com_resolucao())
        .filter(RegistoAvaria.id_edificio == id_edificio, RegistoAvaria.status == 1)
        .order_by(RegistoAvaria.data_registo.desc())
        .all()
    )


def obter(db: Session, id: int):
    avaria = (
        db.query(RegistoAvaria)
        .options(_com_resolucao())
        .filter(RegistoAvaria.id == id, RegistoAvaria.status == 1)
        .first()
    )

    if not avaria:
        raise HTTPException(404, "Avaria não encontrada no sistema")
    return avaria


def criar(db: Session, dados, id_condomino: int):
    avaria = RegistoAvaria(
        id_condomino=id_condomino,
        zona=dados.zona,
        descricao=dados.descricao,
        id_edificio=dados.id_edificio,
        data_registo=datetime.utcnow(),
    )
    db.add(avaria) 
    db.commit() #adiciona à BD
    db.refresh(avaria)
    return avaria


def atualizar(db: Session, id: int, dados):
    avaria = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(avaria, campo, valor)

    db.commit()
    db.refresh(avaria)
    return avaria



def criar_resolucao(db: Session, id_avaria: int, id_tecnico: int):
    verificar = db.query(ResolucaoAvaria).filter(ResolucaoAvaria.id_registo_avaria == id_avaria).first()

    if verificar:
        raise HTTPException(400, "Já existe uma resolução para esta avaria")

    resolucao = ResolucaoAvaria(id_registo_avaria=id_avaria, id_tecnico=id_tecnico)
    db.add(resolucao)
    db.commit()
    db.refresh(resolucao)
    return resolucao


def atualizar_resolucao(db: Session, id_avaria: int, dados):
    resolucao = db.query(ResolucaoAvaria).filter(ResolucaoAvaria.id_registo_avaria == id_avaria).first()

    if not resolucao:
        raise HTTPException(404, "Resolução não encontrada")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(resolucao, campo, valor)

    if resolucao.status == 1 and not resolucao.data_resolucao:
        resolucao.data_resolucao = datetime.utcnow()
        
    db.commit()
    db.refresh(resolucao)
    return resolucao
