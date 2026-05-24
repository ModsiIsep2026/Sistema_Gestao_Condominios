from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_a
from app.estruturas.gestor import CriarGestor, AtualizarGestor, LerGestor
from app.logica import gestor as servico

router = APIRouter(prefix="/gestores", tags=["Gestores"])

# (GET)    /gestores
# Lista os gestores do sistema.


# (GET)    /gestores/{id}
# Mostra os dados de um gestor.


# (POST)   /gestores
# Cria um novo gestor.


# (PUT)    /gestores/{id}
# Atualiza um gestor.


# (DELETE) /gestores/{id}
# Remove um gestor.

@router.get("", response_model=List[LerGestor])
def listar(_=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerGestor)
def obter(id: int, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerGestor, status_code=201)
def criar(dados: CriarGestor, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerGestor)
def atualizar(id: int, dados: AtualizarGestor, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.remover(db, id)
