from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, token_atual
from app.estruturas.material_espaco import CriarMaterialEspaco, AtualizarMaterialEspaco, LerMaterialEspaco
from app.logica import material_espaco as servico

router = APIRouter(prefix="/materiais", tags=["Materiais"])

# (GET)    /materiais - Lista os materiais de um espaço.
# (GET)    /materiais/{id} - Exibe os dados de um material.
# (POST)   /materiais - Cria um novo material.
# (PUT)    /materiais/{id} - Atualiza um material.
# (DELETE) /materiais/{id} - Remove um material.

@router.get("", response_model=List[LerMaterialEspaco])
def listar(id_espaco: int, _=Depends(token_atual), db: Session = Depends(get_db)):
    return servico.listar_pespaco(db, id_espaco)

@router.get("/{id}", response_model=LerMaterialEspaco)
def obter(id: int, _=Depends(token_atual), db: Session = Depends(get_db)):
    return servico.obter(db, id)

@router.post("", response_model=LerMaterialEspaco, status_code=201)
def criar(dados: CriarMaterialEspaco, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.criar(db, dados)

@router.put("/{id}", response_model=LerMaterialEspaco)
def atualizar(id: int, dados: AtualizarMaterialEspaco, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)

@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.remover(db, id)
