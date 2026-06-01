import logging
import time
from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from app.tabelas_bd.condomino import Condomino
from app.configs.seguranca import pw_encript, random_pw
from app.configs.email import enviar_boas_vindas

log = logging.getLogger(__name__)


def _notificar(email: str, nome: str, pw_temp: str) -> None:
    try:
        enviar_boas_vindas(email, nome, pw_temp, "condómino")
        log.info("Email de boas-vindas enviado para %s", email)
    except Exception as exc:
        log.error("Falha ao enviar email para %s: %s", email, exc)


def listar_todos(db: Session):
    return db.query(Condomino).filter(Condomino.status == 1).all()


def listar(db: Session, id_apartamento: int):
    return db.query(Condomino).filter(Condomino.id_apartamento == id_apartamento, Condomino.status == 1).all()


def obter(db: Session, id: int):
    cond = db.query(Condomino).filter(Condomino.id == id, Condomino.status == 1).first()
    if not cond:
        raise HTTPException(404, "Condómino não encontrado")
    return cond


def criar(db: Session, dados, background: BackgroundTasks = None):
    pw_temp = random_pw()
    tel = dados.telemovel if dados.telemovel else f"_p{int(time.time() * 1000)}"
    condomino = Condomino(
        nome=dados.nome,
        email=dados.email,
        pw=pw_encript(pw_temp),
        telemovel=tel,
        id_apartamento=dados.id_apartamento,
    )
    db.add(condomino)
    db.commit()
    db.refresh(condomino)

    if background is not None:
        background.add_task(_notificar, condomino.email, condomino.nome, pw_temp)
    else:
        _notificar(condomino.email, condomino.nome, pw_temp)

    return condomino


def atualizar(db: Session, id: int, dados):
    condomino = db.query(Condomino).filter(Condomino.id == id).first()
    if not condomino:
        raise HTTPException(404, "Condómino não encontrado")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(condomino, campo, valor)

    db.commit()
    db.refresh(condomino)
    return condomino


def remover(db: Session, id: int):
    condomino = obter(db, id)
    condomino.status = 0
    db.commit()
    return {"detalhe": "Condómino removido"}
