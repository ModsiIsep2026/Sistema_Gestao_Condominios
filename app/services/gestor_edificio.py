from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.gestor_edificio import GestorEdificio
from app.models.utilizador import Utilizador
from app.schemas.gestor_edificio import CriarGestorEdificio, AtualizarGestorEdificio


PERFIL_GESTOR = 3


def listar(db: Session, gestor_id: int | None = None, edificio_id: int | None = None, incluir_inativos: bool = False):
    query = db.query(GestorEdificio)
    if not incluir_inativos:
        query = query.filter(GestorEdificio.status == 1)
    if gestor_id is not None:
        query = query.filter(GestorEdificio.gestor_id == gestor_id)
    if edificio_id is not None:
        query = query.filter(GestorEdificio.edificio_id == edificio_id)
    return query.all()


def obter(db: Session, id: int):
    registo = db.query(GestorEdificio).filter(GestorEdificio.id_gestor_edificio == id).first()
    if not registo:
        raise HTTPException(404, "Atribuição não encontrada")
    return registo


def criar(db: Session, dados: CriarGestorEdificio):
    gestor = db.query(Utilizador).filter(
        Utilizador.id_utilizador == dados.gestor_id,
        Utilizador.perfil_id == PERFIL_GESTOR,
    ).first()
    if not gestor:
        raise HTTPException(400, "O utilizador indicado não é um gestor.")

    ja_existe = db.query(GestorEdificio).filter(
        GestorEdificio.gestor_id == dados.gestor_id,
        GestorEdificio.edificio_id == dados.edificio_id,
        GestorEdificio.status == 1,
    ).first()
    if ja_existe:
        raise HTTPException(400, "Este gestor já está atribuído a este edifício.")

    registo = GestorEdificio(
        gestor_id=dados.gestor_id,
        edificio_id=dados.edificio_id,
        data_inicio=dados.data_inicio or date.today(),
        data_fim=dados.data_fim,
        status=1,
    )
    db.add(registo)
    db.commit()
    db.refresh(registo)
    return registo


def atualizar(db: Session, id: int, dados: AtualizarGestorEdificio):
    registo = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(registo, k, v)
    db.commit()
    db.refresh(registo)
    return registo


def remover(db: Session, id: int):
    registo = obter(db, id)
    registo.status = 0
    registo.data_fim = date.today()
    db.commit()
    return {"detalhe": "Atribuição removida"}


def edificios_do_gestor(db: Session, gestor_id: int) -> list[int]:
    """Devolve a lista de IDs de edifícios que o gestor gere atualmente."""
    registos = listar(db, gestor_id=gestor_id)
    return [r.edificio_id for r in registos]
