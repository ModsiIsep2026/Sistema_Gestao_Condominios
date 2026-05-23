from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor
from app.schemas.pagamento import CriarPagamento, LerPagamento
from app.services import pagamento as servico

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

# (GET)  /pagamentos              - Lista por apartamento (?id_apartamento=)  (gestor)
# (POST) /pagamentos              - Gestor gera pagamento (valor calculado)    (gestor)
# (POST) /pagamentos/{id}/pagar   - Marca como pago                            (gestor)


@router.get("", response_model=List[LerPagamento])
def listar(id_apartamento: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar(db, id_apartamento)


@router.post("", response_model=LerPagamento, status_code=201)
def criar(dados: CriarPagamento, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.post("/{id}/pagar", response_model=LerPagamento)
def marcar_pago(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.marcar_pago(db, id)
