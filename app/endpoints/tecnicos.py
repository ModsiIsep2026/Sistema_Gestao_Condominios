from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g
from app.estruturas.tecnico import CriarTecnico, AtualizarTecnico, LerTecnico
from app.logica import tecnico as servico

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])

# (GET)    /tecnicos
# Lista os técnicos associados ao gestor autenticado.


# (GET)    /tecnicos/{id}
# Mostra os dados de um técnico.


# (POST)   /tecnicos
# Cria um novo técnico.


# (PUT)    /tecnicos/{id}
# Atualiza os dados de um técnico.


# (DELETE) /tecnicos/{id}
# Remove um técnico.

@router.get("", response_model=List[LerTecnico])
def listar(gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar(db, gestor.id)


@router.get("/{id}", response_model=LerTecnico)
def obter(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerTecnico, status_code=201)
def criar(dados: CriarTecnico, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerTecnico)
def atualizar(id: int, dados: AtualizarTecnico, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.remover(db, id)
