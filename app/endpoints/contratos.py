from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_admin, so_gestor
from app.schemas.contrato import CriarContrato, AtualizarContrato, LerContrato
from app.services import contrato as servico

router = APIRouter(prefix="/contratos", tags=["Contratos"])

# (GET)  /contratos      - Lista todos os contratos   (admin)
# (GET)  /contratos/meu  - Contrato do gestor         (gestor)
# (POST) /contratos      - Cria contrato              (admin)
# (PUT)  /contratos/meu  - Atualiza contrato próprio  (gestor)


@router.get("", response_model=List[LerContrato])
def listar(_=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/meu", response_model=LerContrato)
def meu_contrato(gestor=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.obter_pgestor(db, gestor.id)


@router.post("", response_model=LerContrato, status_code=201)
def criar(dados: CriarContrato, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/meu", response_model=LerContrato)
def atualizar(dados: AtualizarContrato, gestor=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, gestor.id, dados)
