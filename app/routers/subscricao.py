from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db_connect import get_db
from app.schemas.subscricao import IniciarRegisto, ConcluirPagamento, RespostaInicio
from app.services import subscricao as servico

router = APIRouter(prefix="/subscricao", tags=["Subscrição"])

# (POST) /subscricao/iniciar  - Cria pagamento + registo pendente
# (POST) /subscricao/concluir - Verifica pagamento cria conta gestor e envia email


@router.post("/iniciar", response_model=RespostaInicio)
def iniciar_subscricao(dados: IniciarRegisto, db: Session = Depends(get_db)):
    return servico.iniciar(db, dados.nome, dados.email, dados.telemovel, dados.nif)


@router.post("/concluir")
async def concluir_subscricao(dados: ConcluirPagamento, db: Session = Depends(get_db)):
    return await servico.concluir(db, dados.payment_intent_id, dados.nome, dados.email, dados.telemovel, dados.nif)
