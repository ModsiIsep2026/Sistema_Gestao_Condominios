from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import gestor_ou_administrador, utilizador_atual
from app.schemas.pagamento import CriarPagamento, LerPagamento
from app.services import pagamento as servico

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

# (GET)  /pagamentos - Lista todos os pagamentos
# (POST) /pagamentos - Regista um novo pagamento


@router.get("", response_model=List[LerPagamento])
def listar_pagamentos(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id in [3, 5]:
        return servico.listar(db)
    return servico.listar_por_utilizador(db, utilizador.id_utilizador)


@router.post("", response_model=LerPagamento, status_code=201)
def registar_pagamento(
    dados: CriarPagamento,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if dados.utilizador_id != utilizador.id_utilizador and utilizador.perfil_id not in [3, 5]:
        raise HTTPException(status_code=403, detail="Só pode registar pagamentos para a sua própria conta")
    return servico.criar(db, dados)
