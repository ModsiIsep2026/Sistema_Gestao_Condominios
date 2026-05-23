from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor, token_atual
from app.schemas.espaco import CriarEspaco, AtualizarEspaco, LerEspaco
from app.services import espaco as servico

router = APIRouter(prefix="/espacos", tags=["Espaços"])

# (GET)    /espacos              - Lista espaços de um edifício (?id_edificio=)  (qualquer autenticado)
# (GET)    /espacos/{id}         - Obtém espaço                                  (qualquer autenticado)
# (POST)   /espacos              - Cria espaço                                   (gestor)
# (PUT)    /espacos/{id}         - Atualiza espaço                               (gestor)
# (DELETE) /espacos/{id}         - Remove espaço                                 (gestor)


@router.get("", response_model=List[LerEspaco])
def listar(id_edificio: int, _=Depends(token_atual), db: Session = Depends(get_db)):
    return servico.listar(db, id_edificio)


@router.get("/{id}", response_model=LerEspaco)
def obter(id: int, _=Depends(token_atual), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerEspaco, status_code=201)
def criar(dados: CriarEspaco, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerEspaco)
def atualizar(id: int, dados: AtualizarEspaco, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.remover(db, id)
