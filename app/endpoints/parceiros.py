from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_a
from app.estruturas.parceiro import CriarParceiro, AtualizarParceiro, LerParceiro
from app.logica import parceiro as servico

router = APIRouter(prefix="/parceiros", tags=["Parceiros"])

# (GET)    /parceiros
# Lista todos os parceiros.


# (GET)    /parceiros/{id}
# Mostra os dados de um parceiro.


# (POST)   /parceiros
# Cria um novo parceiro (apenas admin).


# (PUT)    /parceiros/{id}
# Atualiza os dados de um parceiro (apenas admin).


# (DELETE) /parceiros/{id}
# Remove um parceiro (apenas admin).

@router.get("", response_model=List[LerParceiro])
def listar(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerParceiro)
def obter(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerParceiro, status_code=201)
def criar(dados: CriarParceiro, admin=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.criar(db, dados, admin.id)


@router.put("/{id}", response_model=LerParceiro)
def atualizar(id: int, dados: AtualizarParceiro, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.remover(db, id)
