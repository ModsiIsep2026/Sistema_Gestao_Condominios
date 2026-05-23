from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, verificar_c
from app.estruturas.pagamento import CriarPagamento, LerPagamento
from app.logica import pagamento as servico

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

# (GET)  /pagamentos              - Gestor lista pagamentos por apartamento
# (GET)  /pagamentos/meus         - Condómino lista os seus pagamentos
# (POST) /pagamentos              - Gestor gera pagamento mensal 
# (POST) /pagamentos/{id}/pagar   - Condómino paga a sua quota


@router.get("", response_model=List[LerPagamento])
def listar(id_apartamento: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar(db, id_apartamento)


@router.get("/meus", response_model=List[LerPagamento])
def listar_meus(condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar(db, condomino.id_apartamento)


@router.post("", response_model=LerPagamento, status_code=201)
def criar(dados: CriarPagamento, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.post("/{id}/pagar", response_model=LerPagamento)
def pagar(id: int, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.pagamento_feito(db, id)
