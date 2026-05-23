from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor
from app.schemas.condomino import CriarCondomino, AtualizarCondomino, LerCondomino
from app.services import condomino as servico

router = APIRouter(prefix="/condominos", tags=["Condóminos"])

# (GET)    /condominos               - Lista por apartamento (?id_apartamento=)
# (GET)    /condominos/{id}          - Obtém condómino
# (POST)   /condominos               - Cria condómino
# (PUT)    /condominos/{id}          - Atualiza condómino
# (DELETE) /condominos/{id}          - Remove condómino


@router.get("", response_model=List[LerCondomino])
def listar(id_apartamento: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar(db, id_apartamento)


@router.get("/{id}", response_model=LerCondomino)
def obter(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerCondomino, status_code=201)
def criar(dados: CriarCondomino, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerCondomino)
def atualizar(id: int, dados: AtualizarCondomino, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.remover(db, id)
