import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from app.tabelas_bd.tecnico import Tecnico
from app.configs.seguranca import pw_encript, random_pw
from app.configs.email import enviar_boas_vindas

log = logging.getLogger(__name__)


def notificar(email: str, nome: str, pw_temp: str) -> None:
    try:
        enviar_boas_vindas(email, nome, pw_temp, "técnico")
        log.info("Email de boas-vindas enviado para técnico %s", email)
    except Exception as exc:
        log.error("Falha ao enviar email para técnico %s: %s", email, exc)

def listar(db: Session, id_gestor: int):
    return db.query(Tecnico).filter(Tecnico.id_gestor == id_gestor, Tecnico.status == 1).all()

def obter(db: Session, id: int):
    tecnico = db.query(Tecnico).filter(Tecnico.id == id, Tecnico.status == 1).first()
    if not tecnico:
        raise HTTPException(404, "Técnico não encontrado")
    return tecnico

def criar(db: Session, dados, id_gestor: int, background: BackgroundTasks = None):
    pw_temp = random_pw()
    tecnico = Tecnico(
        nome=dados.nome,
        funcao=dados.funcao,
        email=dados.email,
        pw=pw_encript(pw_temp),
        id_gestor=id_gestor,
    )
    db.add(tecnico)
    db.commit()
    db.refresh(tecnico)

    if background is not None:
        background.add_task(notificar, tecnico.email, tecnico.nome, pw_temp)
    else:
        notificar(tecnico.email, tecnico.nome, pw_temp)

    return tecnico


def atualizar(db: Session, id: int, dados):
    tecnico = db.query(Tecnico).filter(Tecnico.id == id).first()
    if not tecnico:
        raise HTTPException(404, "Técnico não encontrado")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(tecnico, campo, valor)

    db.commit()
    db.refresh(tecnico)
    return tecnico


def remover(db: Session, id: int):
    tecnico = obter(db, id)
    tecnico.status = 0 #soft delete
    db.commit()
    return {"detalhe": "Técnico removido"}
