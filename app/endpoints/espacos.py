from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, token_atual
from app.estruturas.espaco import CriarEspaco, AtualizarEspaco, LerEspaco
from app.logica import acesso_gestor
from app.logica import espaco as servico

router = APIRouter(prefix="/espacos", tags=["Espaços"])

# (GET)    /espacos
# Lista os espaços de um edifício.


# (GET)    /espacos/{id}
# Mostra os dados de um espaço.


# (POST)   /espacos
# Cria um novo espaço.


# (PUT)    /espacos/{id}
# Atualiza um espaço.


# (DELETE) /espacos/{id}
# Remove um espaço.

@router.get("", response_model=List[LerEspaco])
def listar(id_edificio: int, _=Depends(token_atual), db: Session = Depends(get_db)):
    return servico.listar(db, id_edificio)


@router.get("/{id}", response_model=LerEspaco)
def obter(id: int, _=Depends(token_atual), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerEspaco, status_code=201)
def criar(dados: CriarEspaco, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_edificio(db, dados.id_edificio, gestor.id)
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerEspaco)
def atualizar(id: int, dados: AtualizarEspaco, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_espaco(db, id, gestor.id)
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_espaco(db, id, gestor.id)
    return servico.remover(db, id)
