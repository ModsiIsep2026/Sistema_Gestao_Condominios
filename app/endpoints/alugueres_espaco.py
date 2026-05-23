from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_c, verificar_g
from app.estruturas.aluguer_espaco import CriarAluguerEspaco, LerAluguerEspaco
from app.logica import aluguer_espaco as servico

router = APIRouter(prefix="/alugueres-espaco", tags=["Alugueres de Espaço"])

# (GET)    /alugueres-espaco        -   Gestor lista todos os alugueres-espaco
# (GET)    /alugueres-espaco/condomino   - Condómino lista os seus
# (POST)   /alugueres-espaco        - Condómino reserva espaço
# (DELETE) /alugueres-espaco/{id}   - Cancela aluguer  (gestor)


@router.get("", response_model=List[LerAluguerEspaco])
def listar(_=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/espaco/{id_espaco}", response_model=List[LerAluguerEspaco])
def listar_pespaco(id_espaco: int, _=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar_pespaco(db, id_espaco)


@router.get("/condomino", response_model=List[LerAluguerEspaco])
def listar_meus(condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)


@router.post("", response_model=LerAluguerEspaco, status_code=201)
def criar(dados: CriarAluguerEspaco, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.criar(db, dados, condomino.id)


@router.delete("/{id}")
def cancelar(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.cancelar(db, id)
