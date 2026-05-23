from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db_connect import get_db
from app.core.seguranca import so_condomino, so_gestor
from app.schemas.aluguer_material import CriarAluguerMaterial, LerAluguerMaterial
from app.services import aluguer_material as servico

router = APIRouter(prefix="/alugueres-material", tags=["Alugueres de Material"])

# (GET)  /alugueres-material        - Gestor lista todos
# (GET)  /alugueres-material/meus   - Condómino lista os seus
# (POST) /alugueres-material        - Condómino aluga material


@router.get("", response_model=List[LerAluguerMaterial])
def listar(_=Depends(so_gestor), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/meus", response_model=List[LerAluguerMaterial])
def meus(condomino=Depends(so_condomino), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)


@router.post("", response_model=LerAluguerMaterial, status_code=201)
def criar(dados: CriarAluguerMaterial, condomino=Depends(so_condomino), db: Session = Depends(get_db)):
    return servico.criar(db, dados, condomino.id)
