from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_c, verificar_g
from app.estruturas.aluguer_material import CriarAluguerMaterial, LerAluguerMaterial
from app.logica import aluguer_material as servico

router = APIRouter(prefix="/alugueres-material", tags=["Alugueres de Material"])

# (GET)  /alugueres-material        -   Gestor lista todos
# (GET)  /alugueres-material/condomino   - Condómino lista os seus
# (POST) /alugueres-material       -    Condómino aluga material
# (DELETE) /alugueres-material/{id}  -  Condómino cancela o seu aluguer

@router.get("", response_model=List[LerAluguerMaterial])
def listar(_=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/condomino", response_model=List[LerAluguerMaterial])
def listar_meus(condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)

@router.post("", response_model=LerAluguerMaterial, status_code=201)
def criar(dados: CriarAluguerMaterial, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.criar(db, dados, condomino.id)

@router.delete("/{id}")
def cancelar(id: int, _=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.cancelar(db, id)
