from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_condomino, so_gestor
from app.schemas.aluguer_espaco import CriarAluguerEspaco, LerAluguerEspaco
from app.services import aluguer_espaco as servico

router = APIRouter(prefix="/alugueres-espaco", tags=["Alugueres de Espaço"])

# (GET)    /alugueres-espaco        - Gestor lista todos
# (GET)    /alugueres-espaco/meus   - Condómino lista os seus
# (POST)   /alugueres-espaco        - Condómino reserva espaço
# (DELETE) /alugueres-espaco/{id}   - Cancela aluguer  (gestor)


@router.get("", response_model=List[LerAluguerEspaco])
def listar(_=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/meus", response_model=List[LerAluguerEspaco])
def meus(condomino=Depends(so_condomino), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)


@router.post("", response_model=LerAluguerEspaco, status_code=201)
def criar(dados: CriarAluguerEspaco, condomino=Depends(so_condomino), db: Session = Depends(get_db)):
    return servico.criar(db, dados, condomino.id)


@router.delete("/{id}")
def cancelar(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.cancelar(db, id)
