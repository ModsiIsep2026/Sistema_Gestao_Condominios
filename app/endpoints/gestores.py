from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_admin
from app.schemas.gestor import CriarGestor, AtualizarGestor, LerGestor
from app.services import gestor as servico

router = APIRouter(prefix="/gestores", tags=["Gestores"])

# (GET)    /gestores       - Lista gestores  (admin)
# (GET)    /gestores/{id}  - Obtém gestor    (admin)
# (POST)   /gestores       - Cria gestor     (admin)
# (PUT)    /gestores/{id}  - Atualiza gestor (admin)
# (DELETE) /gestores/{id}  - Remove gestor   (admin)


@router.get("", response_model=List[LerGestor])
def listar(_=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerGestor)
def obter(id: int, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerGestor, status_code=201)
def criar(dados: CriarGestor, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerGestor)
def atualizar(id: int, dados: AtualizarGestor, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.remover(db, id)
