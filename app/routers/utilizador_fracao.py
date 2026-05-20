from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import gestor_ou_administrador, utilizador_atual
from app.schemas.utilizador_fracao import CriarUtilizadorFracao, LerUtilizadorFracao
from app.services import utilizador_fracao as servico

router = APIRouter(prefix="/utilizador-fracao", tags=["Utilizador Fração"])

# (GET)    /utilizador-fracao       - Lista associações utilizador-fração
# (POST)   /utilizador-fracao       - Cria associação entre utilizador e fração
# (DELETE) /utilizador-fracao/{id}  - Remove associação utilizador-fração 


@router.get("", response_model=List[LerUtilizadorFracao])
def listar_utilizador_fracao(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id in [3, 5]:
        return servico.listar(db)
    return servico.listar_por_utilizador(db, utilizador.id_utilizador)


@router.post("", response_model=LerUtilizadorFracao, status_code=201)
def associar_utilizador_fracao(
    dados: CriarUtilizadorFracao,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.associar(db, dados)


@router.delete("/{id}")
def remover_utilizador_fracao(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.remover(db, id)
