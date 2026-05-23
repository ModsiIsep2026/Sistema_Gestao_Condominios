from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_gestor
from app.schemas.material_espaco import CriarMaterialEspaco, AtualizarMaterialEspaco, LerMaterialEspaco
from app.services import material_espaco as servico

router = APIRouter(prefix="/materiais", tags=["Materiais"])

# (GET)    /materiais              - Lista materiais de um espaço (?id_espaco=)
# (GET)    /materiais/{id}         - Obtém material
# (POST)   /materiais              - Cria material
# (PUT)    /materiais/{id}         - Atualiza material
# (DELETE) /materiais/{id}         - Remove material


@router.get("", response_model=List[LerMaterialEspaco])
def listar(id_espaco: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar_por_espaco(db, id_espaco)


@router.get("/{id}", response_model=LerMaterialEspaco)
def obter(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerMaterialEspaco, status_code=201)
def criar(dados: CriarMaterialEspaco, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerMaterialEspaco)
def atualizar(id: int, dados: AtualizarMaterialEspaco, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.remover(db, id)
