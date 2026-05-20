from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.quota import CriarQuota, AtualizarQuota, LerQuota
from app.services import quota as servico

router = APIRouter(prefix="/quotas", tags=["Quotas"])


@router.get("", response_model=List[LerQuota])
def listar_quotas(db: Session = Depends(get_db)):
    return servico.listar(db)



@router.get("/{id}", response_model=LerQuota)
def obter_quota(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)



@router.post("", response_model=LerQuota, status_code=201)
def criar_quota(dados: CriarQuota, db: Session = Depends(get_db)):
    return servico.criar(db, dados)



@router.put("/{id}", response_model=LerQuota)
def atualizar_quota(id: int, dados: AtualizarQuota, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)
