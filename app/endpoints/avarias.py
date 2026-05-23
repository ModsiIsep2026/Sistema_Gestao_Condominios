from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, verificar_c, verificar_t, token_atual
from app.estruturas.registo_avaria import CriarRegistoAvaria, AtualizarRegistoAvaria, LerRegistoAvaria
from app.estruturas.resolucao_avaria import CriarResolucaoAvaria, AtualizarResolucaoAvaria, LerResolucaoAvaria
from app.logica import avaria as servico

router = APIRouter(prefix="/avarias", tags=["Avarias"])


# (GET)  /avarias                     - Gestor lista por edifício
# (GET)  /avarias/condomino             - Condómino lista as suas
# (GET)  /avarias/{id}                - Obtém avaria
# (POST) /avarias                     - Condómino reporta avaria
# (PUT)  /avarias/{id}                - Gestor atualiza avaria
# (POST) /avarias/{id}/resolucao      - Gestor aloca técnico
# (PUT)  /avarias/{id}/resolucao      - Técnico atualiza estado


@router.get("", response_model=List[LerRegistoAvaria])
def listar(id_edificio: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar_pedificio(db, id_edificio)


@router.get("/condomino", response_model=List[LerRegistoAvaria])
def listar_minhas(condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)


@router.get("/{id}", response_model=LerRegistoAvaria)
def obter(id: int, _=Depends(token_atual), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerRegistoAvaria, status_code=201)
def criar(dados: CriarRegistoAvaria, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.criar(db, dados, condomino.id)


@router.put("/{id}", response_model=LerRegistoAvaria)
def atualizar(id: int, dados: AtualizarRegistoAvaria, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.post("/{id}/resolucao", response_model=LerResolucaoAvaria, status_code=201)
def criar_resolucao(id: int, dados: CriarResolucaoAvaria, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.criar_resolucao(db, id, dados.id_tecnico)


@router.put("/{id}/resolucao", response_model=LerResolucaoAvaria)
def atualizar_resolucao(id: int, dados: AtualizarResolucaoAvaria, _=Depends(verificar_t), db: Session = Depends(get_db)):
    return servico.atualizar_resolucao(db, id, dados)
