from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import gestor_ou_administrador
from app.schemas.despesa import CriarDespesa, AtualizarDespesa, LerDespesa
from app.services import despesa as servico

router = APIRouter(prefix="/despesas", tags=["Despesas"])


# (GET)  /despesas       - Lista todas as despesas registadas
# (GET)  /despesas/{id}  - Obtém os detalhes de uma despesa específica
# (POST) /despesas       - Regista uma nova despesa
# (PUT)  /despesas/{id}  - Atualiza os dados de uma despesa existente


@router.get("", response_model=List[LerDespesa])
def listar_despesas(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerDespesa)
def obter_despesa(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.obter(db, id)


@router.post("", response_model=LerDespesa, status_code=201)
def criar_despesa(
    dados: CriarDespesa,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerDespesa)
def atualizar_despesa(
    id: int,
    dados: AtualizarDespesa,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.atualizar(db, id, dados)
