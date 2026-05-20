from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.espaco_comum import CriarEspaco, AtualizarEspaco, LerEspaco
from app.services import espaco as servico

router = APIRouter(prefix="/espacos", tags=["Espaços Comuns"])


# (GET)  /espacos       - Lista todos os espaços comuns
# (GET)  /espacos/{id}  - Obtém os detalhes de um espaço comum específico
# (POST) /espacos       - Cria um novo espaço comum
# (PUT)  /espacos/{id}  - Atualiza um espaço comum existente


@router.get("", response_model=List[LerEspaco])
def listar_espacos(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerEspaco)
def obter_espaco(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerEspaco, status_code=201)
def criar_espaco(dados: CriarEspaco, db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerEspaco)
def atualizar_espaco(id: int, dados: AtualizarEspaco, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)
