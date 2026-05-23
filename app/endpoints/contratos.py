from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_a, verificar_g
from app.estruturas.contrato import (
    CriarContrato, AtualizarContrato, LerContrato,
    IniciarPagamento, ConcluirPagamento,
)
from app.logica import contrato as servico

router = APIRouter(prefix="/contratos", tags=["Contratos"])

# (GET)  /contratos           - Lista todos os contratos  (admin)
# (GET)  /contratos/gestor    - Contrato do gestor        (gestor)
# (POST) /contratos           - Cria contrato             (admin)
# (PUT)  /contratos/meu       - Atualiza contrato próprio (gestor)
# (POST) /contratos/iniciar   - Inicia pagamento Stripe   (público)
# (POST) /contratos/concluir  - Conclui pagamento e cria conta (público)


@router.get("", response_model=List[LerContrato])
def listar(_=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/gestor", response_model=LerContrato)
def obter_meu(gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.obter_pgestor(db, gestor.id)


@router.post("", response_model=LerContrato, status_code=201)
def criar(dados: CriarContrato, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/meu", response_model=LerContrato)
def atualizar(dados: AtualizarContrato, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, gestor.id, dados)



@router.post("/iniciar")
def iniciar_pagamento(dados: IniciarPagamento, db: Session = Depends(get_db)):
    return servico.iniciar_pagamento(db, dados)


@router.post("/concluir")
def concluir_pagamento(dados: ConcluirPagamento, db: Session = Depends(get_db)):
    return servico.concluir_pagamento(db, dados)
