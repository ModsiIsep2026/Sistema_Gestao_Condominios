from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import gestor_ou_administrador, tecnico_ou_superior, utilizador_atual, ACESSO_NEGADO
from app.schemas.ordem_trabalho import CriarOrdemTrabalho, AtualizarOrdemTrabalho, LerOrdemTrabalho
from app.services import ordem_trabalho as servico

router = APIRouter(prefix="/ordens-trabalho", tags=["Ordens de Trabalho"])

# (GET)  /ordens-trabalho       - Lista todas as ordens de trabalho
# (GET)  /ordens-trabalho/{id}  - Obtém os detalhes de uma ordem de trabalho específica
# (POST) /ordens-trabalho       - Cria uma nova ordem de trabalho
# (PUT)  /ordens-trabalho/{id}  - Atualiza uma ordem de trabalho existente


@router.get("", response_model=List[LerOrdemTrabalho])
def listar_ordens(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id in [3, 4, 5]:
        return servico.listar(db)
    return servico.listar_por_utilizador(db, utilizador.id_utilizador)


@router.get("/{id}", response_model=LerOrdemTrabalho)
def obter_ordem(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    ordem = servico.obter(db, id)
    if utilizador.perfil_id in [3, 4, 5] or ordem.avaria.utilizador_id == utilizador.id_utilizador:
        return ordem
    raise ACESSO_NEGADO


@router.post("", response_model=LerOrdemTrabalho, status_code=201)
def criar_ordem(
    dados: CriarOrdemTrabalho,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerOrdemTrabalho)
def atualizar_ordem(
    id: int,
    dados: AtualizarOrdemTrabalho,
    db: Session = Depends(get_db),
    _=Depends(tecnico_ou_superior),
):
    return servico.atualizar(db, id, dados)
