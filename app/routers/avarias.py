from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.schemas.avaria import CriarAvaria, AtualizarAvaria, LerAvaria
from app.services import avaria as servico

router = APIRouter(prefix="/avarias", tags=["Avarias"])


# (GET)  /avarias       - Lista todas as avarias registadas
# (GET)  /avarias/{id}  - Obtém os detalhes de uma avaria específica
# (POST) /avarias       - Regista uma nova avaria
# (PUT)  /avarias/{id}  - Atualiza os dados de uma avaria existente


@router.get("", response_model=List[LerAvaria])
def listar_avarias(db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/{id}", response_model=LerAvaria)
def obter_avaria(id: int, db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerAvaria, status_code=201)
def criar_avaria(dados: CriarAvaria, db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerAvaria)
def atualizar_avaria(id: int, dados: AtualizarAvaria, db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)
