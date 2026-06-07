import json
import threading
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.configs.db_connect import get_db
from app.configs.seguranca import token_atual
from app.tabelas_bd.condomino import Condomino
from app.tabelas_bd.tecnico import Tecnico
from app.tabelas_bd.gestor import Gestor
from app.tabelas_bd.edificio import Edificio

router = APIRouter(prefix="/suporte", tags=["Suporte"])

FILE = Path(__file__).resolve().parent.parent.parent / "data" / "suporte_msgs.json"
LOCK = threading.Lock()


def ler() -> list:
    if not FILE.exists():
        return []
    try:
        return json.loads(FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def guardar(msgs: list) -> None:
    FILE.parent.mkdir(parents=True, exist_ok=True)
    FILE.write_text(json.dumps(msgs, ensure_ascii=False, indent=2), encoding="utf-8")


def proximo_id(msgs: list) -> int:
    return max((m["id"] for m in msgs), default=0) + 1


class EnviarMensagem(BaseModel):
    assunto: str
    mensagem: str


@router.post("")
def enviar(body: EnviarMensagem, token: dict = Depends(token_atual), db: Session = Depends(get_db)):
    tipo = token["tipo"]
    uid  = token["id"]

    if tipo == "admin":
        raise HTTPException(400, "Admin não pode enviar mensagens de suporte.")


    if tipo == "gestor":
        u = db.query(Gestor).filter_by(id=uid, status=1).first()
        if not u:
            raise HTTPException(404, "Utilizador não encontrado.")
        id_destinatario = None  # vai para o admin
        nome_remetente  = u.nome

    elif tipo == "condomino":
        u = db.query(Condomino).filter_by(id=uid, status=1).first()
        if not u:
            raise HTTPException(404, "Utilizador não encontrado.")
        id_destinatario = u.apartamento.edificio.id_gestor
        nome_remetente  = u.nome

    elif tipo == "tecnico":
        u = db.query(Tecnico).filter_by(id=uid, status=1).first()
        if not u:
            raise HTTPException(404, "Utilizador não encontrado.")
        id_destinatario = u.id_gestor
        nome_remetente  = u.nome

    else:
        raise HTTPException(400, "Tipo de utilizador inválido.")

    nova = {
        "id":              0,
        "assunto":         body.assunto.strip(),
        "mensagem":        body.mensagem.strip(),
        "data_envio":      datetime.now().isoformat(timespec="seconds"),
        "lida":            False,
        "tipo_remetente":  tipo,
        "id_remetente":    uid,
        "nome_remetente":  nome_remetente,
        "id_destinatario": id_destinatario,
    }

    with LOCK:
        msgs = ler()
        nova["id"] = proximo_id(msgs)
        msgs.append(nova)
        guardar(msgs)

    return {"mensagem": "Mensagem enviada com sucesso.", "id": nova["id"]}


@router.get("/enviadas")
def enviadas(token: dict = Depends(token_atual)):
    tipo = token["tipo"]
    uid  = token["id"]
    msgs = ler()
    resultado = [m for m in msgs if m["tipo_remetente"] == tipo and m["id_remetente"] == uid]
    return sorted(resultado, key=lambda m: m["data_envio"], reverse=True)


@router.get("/recebidas")
def recebidas(token: dict = Depends(token_atual)):
    tipo = token["tipo"]
    uid  = token["id"]
    msgs = ler()

    if tipo == "admin":
        resultado = [m for m in msgs if m["id_destinatario"] is None]
    elif tipo == "gestor":
        resultado = [m for m in msgs if m["id_destinatario"] == uid]
    else:
        raise HTTPException(403, "Sem permissão para ver mensagens recebidas.")

    return sorted(resultado, key=lambda m: m["data_envio"], reverse=True)


@router.patch("/{id_msg}/lida")
def marcar_lida(id_msg: int, token: dict = Depends(token_atual)):
    tipo = token["tipo"]
    uid  = token["id"]

    with LOCK:
        msgs = ler()
        for m in msgs:
            if m["id"] == id_msg:
                # verificar quem é o destinatário
                if tipo == "admin" and m["id_destinatario"] is None:
                    m["lida"] = True
                elif tipo == "gestor" and m["id_destinatario"] == uid:
                    m["lida"] = True
                else:
                    raise HTTPException(403, "Sem permissão.")
                guardar(msgs)
                return {"ok": True}
        raise HTTPException(404, "Mensagem não encontrada.")


@router.get("/nao-lidas")
def nao_lidas(token: dict = Depends(token_atual)):
    tipo = token["tipo"]
    uid  = token["id"]
    msgs = ler()

    if tipo == "admin":
        count = sum(1 for m in msgs if m["id_destinatario"] is None and not m["lida"])
    elif tipo == "gestor":
        count = sum(1 for m in msgs if m["id_destinatario"] == uid and not m["lida"])
    else:
        count = 0

    return {"count": count}
