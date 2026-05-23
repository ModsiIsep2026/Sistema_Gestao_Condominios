from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_admin
from app.schemas.parceiro import CriarParceiro, AtualizarParceiro, LerParceiro
from app.services import parceiro as servico

router = APIRouter(prefix="/parceiros", tags=["Parceiros"])

# (GET)    /parceiros       - Lista parceiros
# (GET)    /parceiros/{id}  - Obtém parceiro
# (POST)   /parceiros       - Cria parceiro  (admin)
# (PUT)    /parceiros/{id}  - Atualiza       (admin)
# (DELETE) /parceiros/{id}  - Remove         (admin)


@router.get("", response_model=List[LerParceiro])
def listar(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerParceiro)
def obter(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerParceiro, status_code=201)
def criar(dados: CriarParceiro, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerParceiro)
def atualizar(id: int, dados: AtualizarParceiro, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.remover(db, id)
