from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g
from app.estruturas.apartamento import CriarApartamento, AtualizarApartamento, LerApartamento
from app.logica import acesso_gestor
from app.logica import apartamento as servico

router = APIRouter(prefix="/apartamentos", tags=["Apartamentos"])

# (GET)    /apartamentos - Lista os apartamentos de um edifício.
# (GET)    /apartamentos/{id} - Exibe os dados de um apartamento específico.
# (POST)   /apartamentos - Cria um novo apartamento.
# (PUT)    /apartamentos/{id} - Atualiza os dados de um apartamento.
# (DELETE) /apartamentos/{id} - Remove um apartamento.

@router.get("", response_model=List[LerApartamento])
def listar(id_edificio: int, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_edificio(db, id_edificio, gestor.id)
    return servico.listar(db, id_edificio)

@router.get("/{id}", response_model=LerApartamento)
def obter(id: int, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_apartamento(db, id, gestor.id)
    return servico.obter(db, id)


@router.post("", response_model=LerApartamento, status_code=201)
def criar(dados: CriarApartamento, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_edificio(db, dados.id_edificio, gestor.id)
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerApartamento)
def atualizar(id: int, dados: AtualizarApartamento, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_apartamento(db, id, gestor.id)
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_apartamento(db, id, gestor.id)
    return servico.remover(db, id)
