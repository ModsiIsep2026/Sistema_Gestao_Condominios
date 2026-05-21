from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import gestor_ou_administrador, utilizador_atual, ACESSO_NEGADO
from app.schemas.avaria import CriarAvaria, AtualizarAvaria, LerAvaria
from app.services import avaria as servico

router = APIRouter(prefix="/avarias", tags=["Avarias"])


# (GET)  /avarias       - Lista todas as avarias registadas
# (GET)  /avarias/{id}  - Obtém os detalhes de uma avaria específica
# (POST) /avarias       - Regista uma nova avaria
# (PUT)  /avarias/{id}  - Atualiza os dados de uma avaria existente


@router.get("", response_model=List[LerAvaria])
def listar_avarias(
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if utilizador.perfil_id in [3, 4, 5]:
        return servico.listar(db)
    return servico.listar_por_utilizador(db, utilizador.id_utilizador)


@router.get("/{id}", response_model=LerAvaria)
def obter_avaria(
    id: int,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    avaria = servico.obter(db, id)
    if utilizador.perfil_id in [3, 4, 5] or avaria.utilizador_id == utilizador.id_utilizador:
        return avaria
    raise ACESSO_NEGADO


@router.post("", response_model=LerAvaria, status_code=201)
def criar_avaria(
    dados: CriarAvaria,
    db: Session = Depends(get_db),
    utilizador=Depends(utilizador_atual),
):
    if dados.utilizador_id != utilizador.id_utilizador:
        raise HTTPException(status_code=403, detail="Só pode registar avarias para si próprio")
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerAvaria)
def atualizar_avaria(
    id: int,
    dados: AtualizarAvaria,
    db: Session = Depends(get_db),
    _=Depends(gestor_ou_administrador),
):
    return servico.atualizar(db, id, dados)
