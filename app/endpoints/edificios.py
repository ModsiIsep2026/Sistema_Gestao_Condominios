from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_a, verificar_g
from app.estruturas.edificio import CriarEdificio, AtualizarEdificio, LerEdificio
from app.logica import edificio as servico

router = APIRouter(prefix="/edificios", tags=["Edifícios"])

# (GET)    /edificios          - Lista edifícios do gestor autenticado     (gestor)
# (GET)    /edificios/todos    - Lista todos os edifícios da plataforma    (admin)
# (GET)    /edificios/{id}     - Obtém edifício
# (POST)   /edificios          - Cria edifício                             (gestor)
# (PUT)    /edificios/{id}     - Atualiza edifício                         (gestor)
# (DELETE) /edificios/{id}     - Remove edifício                           (gestor)


@router.get("", response_model=List[LerEdificio])
def listar(gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar(db, gestor.id)


@router.get("/todos", response_model=List[LerEdificio])
def listar_todos(_=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.listar_todos(db)


@router.get("/{id}", response_model=LerEdificio)
def obter(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerEdificio, status_code=201)
def criar(dados: CriarEdificio, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.criar(db, dados, gestor.id)


@router.put("/{id}", response_model=LerEdificio)
def atualizar(id: int, dados: AtualizarEdificio, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.remover(db, id)
