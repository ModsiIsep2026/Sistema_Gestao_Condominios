from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.db_connect import get_db
from app.core.seguranca import administrador, utilizador_atual, ACESSO_NEGADO, PERFIL_ADMINISTRADOR, PERFIL_GESTOR
from app.schemas.gestor_edificio import CriarGestorEdificio, AtualizarGestorEdificio, LerGestorEdificio
from app.services import gestor_edificio as servico


router = APIRouter(prefix="/gestor-edificio", tags=["Gestor-Edifício"])


@router.get("", response_model=List[LerGestorEdificio])
def listar(
    gestor_id: Optional[int] = None,
    edificio_id: Optional[int] = None,
    incluir_inativos: bool = False,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id == PERFIL_ADMINISTRADOR:
        return servico.listar(db, gestor_id=gestor_id, edificio_id=edificio_id, incluir_inativos=incluir_inativos)

    if utilizador.perfil_id == PERFIL_GESTOR:
        return servico.listar(db, gestor_id=utilizador.id_utilizador, incluir_inativos=incluir_inativos)

    raise ACESSO_NEGADO


@router.post("", response_model=LerGestorEdificio, status_code=201)
def criar(
    dados: CriarGestorEdificio,
    db: Session = Depends(get_db),
    _=Depends(administrador),
):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerGestorEdificio)
def atualizar(
    id: int,
    dados: AtualizarGestorEdificio,
    db: Session = Depends(get_db),
    _=Depends(administrador),
):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(administrador),
):
    return servico.remover(db, id)
