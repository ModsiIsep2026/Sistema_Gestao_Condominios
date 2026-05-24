from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.estruturas.licenca import LerLicenca
from app.logica import licenca as servico

router = APIRouter(prefix="/licencas", tags=["Licenças"])


# (GET) /licencas
# Lista todas as licenças disponíveis no sistema.


# Licenças são públicas (o gestor escolhe ao registar-se)
@router.get("", response_model=List[LerLicenca])
def listar(db: Session = Depends(get_db)):
    return servico.listar(db)
