from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import utilizador_atual
from app.models.notificacao import Notificacao
from app.schemas.notificacao import LerNotificacao
from app.services import notificacao as servico

router = APIRouter(prefix="/notificacoes", tags=["Notificações"])


# (GET)  /notificacoes          - Lista todas as notificações
# (PUT)  /notificacoes/{id}/lida - Marca uma notificação como lida


@router.get("", response_model=List[LerNotificacao])
def listar_notificacoes(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id == 5:
        return servico.listar(db)
    return servico.listar_por_utilizador(db, utilizador.id_utilizador)


@router.put("/{id}/lida", response_model=LerNotificacao)
def marcar_como_lida(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    notificacao = db.query(Notificacao).filter(Notificacao.id_notificacao == id, Notificacao.status == 1).first()
    if not notificacao:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    if notificacao.utilizador_id != utilizador.id_utilizador and utilizador.perfil_id != 5:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return servico.marcar_como_lida(db, id)
