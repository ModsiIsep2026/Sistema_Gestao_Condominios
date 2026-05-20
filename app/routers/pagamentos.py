from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.pagamento import CriarPagamento, LerPagamento
from app.services import pagamento as servico

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])


@router.get("", response_model=List[LerPagamento])
def listar_pagamentos(db: Session = Depends(get_db)):
    return servico.listar(db)



@router.post("", response_model=LerPagamento, status_code=201)
def registar_pagamento(dados: CriarPagamento, db: Session = Depends(get_db)):
    return servico.criar(db, dados)
