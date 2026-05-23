from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor, so_condomino, so_tecnico
from app.schemas.registo_avaria import CriarRegistoAvaria, AtualizarRegistoAvaria, LerRegistoAvaria
from app.schemas.resolucao_avaria import CriarResolucaoAvaria, AtualizarResolucaoAvaria, LerResolucaoAvaria
from app.services import avaria as servico

router = APIRouter(prefix="/avarias", tags=["Avarias"])

# ── Registo de Avaria ──────────────────────────────────────────────────────────
# (GET)  /avarias                     - Gestor lista por edifício (?id_edificio=)
# (GET)  /avarias/minhas              - Condómino lista as suas
# (GET)  /avarias/{id}                - Obtém avaria
# (POST) /avarias                     - Condómino reporta avaria
# (PUT)  /avarias/{id}                - Gestor atualiza avaria

# ── Resolução ─────────────────────────────────────────────────────────────────
# (POST) /avarias/{id}/resolucao      - Gestor aloca técnico
# (PUT)  /avarias/{id}/resolucao      - Técnico atualiza estado


@router.get("", response_model=List[LerRegistoAvaria])
def listar(id_edificio: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar_pedificio(db, id_edificio)


@router.get("/minhas", response_model=List[LerRegistoAvaria])
def minhas(condomino=Depends(so_condomino), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)


@router.get("/{id}", response_model=LerRegistoAvaria)
def obter(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerRegistoAvaria, status_code=201)
def criar(dados: CriarRegistoAvaria, condomino=Depends(so_condomino), db: Session = Depends(get_db)):
    return servico.criar(db, dados, condomino.id)


@router.put("/{id}", response_model=LerRegistoAvaria)
def atualizar(id: int, dados: AtualizarRegistoAvaria, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


# ── Resolução ─────────────────────────────────────────────────────────────────

@router.post("/{id}/resolucao", response_model=LerResolucaoAvaria, status_code=201)
def criar_resolucao(id: int, dados: CriarResolucaoAvaria, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar_resolucao(db, id, dados.id_tecnico)


@router.put("/{id}/resolucao", response_model=LerResolucaoAvaria)
def atualizar_resolucao(id: int, dados: AtualizarResolucaoAvaria, _=Depends(so_tecnico), db: Session = Depends(get_db)):
    return servico.atualizar_resolucao(db, id, dados)
