from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.fornecedor import CriarFornecedor, AtualizarFornecedor, LerFornecedor
from app.services import fornecedor as servico

router = APIRouter(prefix="/fornecedores", tags=["Fornecedores"])


# (GET)  /fornecedores       - Lista todos os fornecedores
# (GET)  /fornecedores/{id}  - Obtém os detalhes de um fornecedor específico
# (POST) /fornecedores       - Cria um novo fornecedor
# (PUT)  /fornecedores/{id}  - Atualiza um fornecedor existente


@router.get("", response_model=List[LerFornecedor])
def listar_fornecedores(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerFornecedor)
def obter_fornecedor(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerFornecedor, status_code=201)
def criar_fornecedor(dados: CriarFornecedor, db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerFornecedor)
def atualizar_fornecedor(id: int, dados: AtualizarFornecedor, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)
