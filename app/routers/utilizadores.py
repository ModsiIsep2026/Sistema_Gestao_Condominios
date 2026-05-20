from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.utilizador import CriarUtilizador, AtualizarUtilizador, LerUtilizador
from app.services import utilizador as servico

router = APIRouter(prefix="/utilizadores", tags=["Utilizadores"])

# (GET)    /utilizadores       - Lista todos os utilizadores
# (GET)    /utilizadores/{id}  - Obtém os detalhes de um utilizador específico
# (POST)   /utilizadores       - Cria um novo utilizador
# (PUT)    /utilizadores/{id}  - Atualiza um utilizador existente
# (DELETE) /utilizadores/{id}  - Remove um utilizador (soft delete)

@router.get("", response_model=List[LerUtilizador])
def listar_utilizadores(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerUtilizador)
def obter_utilizador(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerUtilizador, status_code=201)
def criar_utilizador(dados: CriarUtilizador, db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerUtilizador)
def atualizar_utilizador(id: int, dados: AtualizarUtilizador, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover_utilizador(id: int, db: Session = Depends(get_db)):
    return servico.remover(db, id)
