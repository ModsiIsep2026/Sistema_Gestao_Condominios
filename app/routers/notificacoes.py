from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.notificacao import LerNotificacao
from app.services import notificacao as servico

router = APIRouter(prefix="/notificacoes", tags=["Notificações"])


# (GET)  /notificacoes          - Lista todas as notificações
# (PUT)  /notificacoes/{id}/lida - Marca uma notificação como lida


@router.get("", response_model=List[LerNotificacao])
def listar_notificacoes(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.put("/{id}/lida", response_model=LerNotificacao)
def marcar_como_lida(id: int, db: Session = Depends(get_db)):
    return servico.marcar_como_lida(db, id)
