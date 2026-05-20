from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import gestor_ou_administrador, utilizador_atual
from app.models.utilizador_fracao import UtilizadorFracao
from app.schemas.quota import CriarQuota, AtualizarQuota, LerQuota
from app.services import quota as servico

router = APIRouter(prefix="/quotas", tags=["Quotas"])

# (GET)  /quotas       - Lista todas as quotas
# (GET)  /quotas/{id}  - Obtém os detalhes de uma quota específica
# (POST) /quotas       - Cria uma nova quota
# (PUT)  /quotas/{id}  - Atualiza uma quota existente


@router.get("", response_model=List[LerQuota])
def listar_quotas(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id in [3, 5]:
        return servico.listar(db)
    return servico.listar_por_utilizador(db, utilizador.id_utilizador)


@router.get("/{id}", response_model=LerQuota)
def obter_quota(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    quota = servico.obter(db, id)
    if utilizador.perfil_id in [3, 5]:
        return quota
    if quota.fracao_id in [f.fracao_id for f in db.query(UtilizadorFracao).filter(UtilizadorFracao.utilizador_id == utilizador.id_utilizador, UtilizadorFracao.status == 1).all()]:
        return quota
    raise HTTPException(status_code=403, detail="Acesso negado")


@router.post("", response_model=LerQuota, status_code=201)
def criar_quota(
    dados: CriarQuota,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerQuota)
def atualizar_quota(
    id: int,
    dados: AtualizarQuota,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.atualizar(db, id, dados)
