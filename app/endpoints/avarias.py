from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, verificar_c, verificar_t, token_atual, verificar_a
from app.estruturas.registo_avaria import CriarRegistoAvaria, AtualizarRegistoAvaria, LerRegistoAvaria
from app.estruturas.resolucao_avaria import CriarResolucaoAvaria, AtualizarResolucaoAvaria, LerResolucaoAvaria
from app.logica import avaria as servico

router = APIRouter(prefix="/avarias", tags=["Avarias"])


# (GET)  /avarias
# Lista as avarias de um edifício.


# (GET)  /avarias/tecnico
# Lista as avarias atribuídas ao técnico autenticado.


# (GET)  /avarias/condomino
# Lista as avarias reportadas pelo condómino autenticado.


# (GET)  /avarias/{id}
# Mostra os detalhes de uma avaria específica.


# (POST) /avarias
# Cria um novo registo de avaria.


# (PUT)  /avarias/{id}
# Atualiza uma avaria.


# (POST) /avarias/{id}/resolucao
# Atribui um técnico para resolver a avaria.


# (PUT)  /avarias/{id}/resolucao
# Atualiza o estado da resolução da avaria.

@router.get("", response_model=List[LerRegistoAvaria])
def listar(id_edificio: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar_pedificio(db, id_edificio)


@router.get("/tecnico", response_model=List[LerRegistoAvaria])
def listar_tecnico(tecnico=Depends(verificar_t), db: Session = Depends(get_db)):
    return servico.listar_ptecnico(db, tecnico.id)


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
