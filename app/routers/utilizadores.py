from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import (
    utilizador_atual,
    administrador,
    ACESSO_NEGADO,
    PERFIL_ADMINISTRADOR,
    PERFIL_GESTOR,
    PERFIL_CONDOMINO,
    PERFIL_TECNICO,
)
from app.schemas.utilizador import CriarUtilizador, AtualizarUtilizador, LerUtilizador, CriarUtilizadorPorAdmin
from app.services import utilizador as servico

router = APIRouter(prefix="/utilizadores", tags=["Utilizadores"])

# (GET)    /utilizadores       - Lista todos os utilizadores
# (GET)    /utilizadores/{id}  - Obtém os detalhes de um utilizador específico
# (POST)   /utilizadores       - Cria um novo utilizador
# (POST)   /utilizadores/convidar - Convida (gera password e envia email)
# (PUT)    /utilizadores/{id}  - Atualiza um utilizador existente
# (DELETE) /utilizadores/{id}  - Remove um utilizador (soft delete)


def perfis_geridos(utilizador) -> list[int]:

    if utilizador.perfil_id == PERFIL_ADMINISTRADOR:
        return [PERFIL_GESTOR]
    if utilizador.perfil_id == PERFIL_GESTOR:
        return [PERFIL_CONDOMINO, PERFIL_TECNICO]
    raise ACESSO_NEGADO


@router.get("", response_model=List[LerUtilizador])
def listar_utilizadores(
    incluir_inativos: bool = False,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    return servico.listar(db, perfil_ids=perfis_geridos(utilizador), incluir_inativos=incluir_inativos)


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

    raise ACESSO_NEGADO


@router.post("", response_model=LerUtilizador, status_code=201)
def criar_utilizador(
    dados: CriarUtilizador,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if dados.perfil_id not in perfis_geridos(utilizador):
        raise HTTPException(403)
    return servico.criar(db, dados)


@router.post("/convidar", response_model=LerUtilizador, status_code=201)
async def convidar_utilizador(
    dados: CriarUtilizadorPorAdmin,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
   
    if dados.perfil_id not in perfis_geridos(utilizador):
        raise HTTPException(403)
    return await servico.criar_por_admin(db, dados)


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
            raise HTTPException(403, "Não pode alterar o seu próprio perfil.")
        return servico.atualizar(db, id, dados)

    # Admin tem acesso a tudo
    if utilizador.perfil_id == PERFIL_ADMINISTRADOR:
        return servico.atualizar(db, id, dados)

    # Gestor só pode atualizar condóminos e técnicos
    if utilizador.perfil_id == PERFIL_GESTOR and alvo.perfil_id in [PERFIL_CONDOMINO, PERFIL_TECNICO]:
        if dados.perfil_id is not None and dados.perfil_id not in [PERFIL_CONDOMINO, PERFIL_TECNICO]:
            raise HTTPException(403, "Gestores só podem manter condóminos ou técnicos.")
        return servico.atualizar(db, id, dados)

    raise ACESSO_NEGADO


@router.delete("/{id}")
def remover_utilizador(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(administrador),
):
    return servico.remover(db, id)
