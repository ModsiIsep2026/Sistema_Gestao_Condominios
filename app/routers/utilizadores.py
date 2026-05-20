from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import (
    utilizador_atual,
    administrador,
    PERFIL_ADMINISTRADOR,
    PERFIL_GESTOR,
    PERFIL_CONDOMINO,
    PERFIL_TECNICO,
)
from app.schemas.utilizador import CriarUtilizador, AtualizarUtilizador, LerUtilizador
from app.services import utilizador as servico

router = APIRouter(prefix="/utilizadores", tags=["Utilizadores"])

# (GET)    /utilizadores       - Lista todos os utilizadores
# (GET)    /utilizadores/{id}  - Obtém os detalhes de um utilizador específico
# (POST)   /utilizadores       - Cria um novo utilizador
# (PUT)    /utilizadores/{id}  - Atualiza um utilizador existente
# (DELETE) /utilizadores/{id}  - Remove um utilizador (soft delete)


@router.get("", response_model=List[LerUtilizador])
def listar_utilizadores(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id == PERFIL_ADMINISTRADOR:
        return servico.listar(db)

    if utilizador.perfil_id == PERFIL_GESTOR:
        return servico.listar(db, perfil_ids=[PERFIL_CONDOMINO, PERFIL_TECNICO])

    raise HTTPException(status_code=403, detail="Acesso negado")


@router.get("/{id}", response_model=LerUtilizador)
def obter_utilizador(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    alvo = servico.obter(db, id)

    if utilizador.id_utilizador == alvo.id_utilizador:
        return alvo

    if utilizador.perfil_id == PERFIL_ADMINISTRADOR:
        return alvo

    if utilizador.perfil_id == PERFIL_GESTOR and alvo.perfil_id in [PERFIL_CONDOMINO, PERFIL_TECNICO]:
        return alvo

    raise HTTPException(status_code=403, detail="Acesso negado")


@router.post("", response_model=LerUtilizador, status_code=201)
def criar_utilizador(
    dados: CriarUtilizador,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id == PERFIL_ADMINISTRADOR:
        return servico.criar(db, dados)

    if utilizador.perfil_id == PERFIL_GESTOR:
        if dados.perfil_id not in [PERFIL_CONDOMINO, PERFIL_TECNICO]:
            raise HTTPException(status_code=403, detail="Gestores só podem criar condomínios e técnicos")
        return servico.criar(db, dados)

    raise HTTPException(status_code=403, detail="Acesso negado")


@router.put("/{id}", response_model=LerUtilizador)
def atualizar_utilizador(
    id: int,
    dados: AtualizarUtilizador,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    alvo = servico.obter(db, id)

    if utilizador.id_utilizador == alvo.id_utilizador:
        if dados.perfil_id is not None and dados.perfil_id != alvo.perfil_id:
            raise HTTPException(status_code=403, detail="Não pode alterar o seu próprio perfil")
        return servico.atualizar(db, id, dados)

    if utilizador.perfil_id == PERFIL_ADMINISTRADOR:
        return servico.atualizar(db, id, dados)

    if (
        utilizador.perfil_id == PERFIL_GESTOR
        and alvo.perfil_id in [PERFIL_CONDOMINO, PERFIL_TECNICO]
    ):
        if dados.perfil_id is not None and dados.perfil_id not in [PERFIL_CONDOMINO, PERFIL_TECNICO]:
            raise HTTPException(status_code=403, detail="Gestores só podem manter condomínios ou técnicos")
        return servico.atualizar(db, id, dados)

    raise HTTPException(status_code=403, detail="Acesso negado")


@router.delete("/{id}")
def remover_utilizador(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(administrador),
):
    return servico.remover(db, id)
