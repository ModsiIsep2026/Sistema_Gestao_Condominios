from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_c, verificar_g
from app.estruturas.aluguer_material import CriarAluguerMaterial, LerAluguerMaterial
from app.tabelas_bd.aluguer_material import AluguerMaterial
from app.logica import aluguer_material as servico

router = APIRouter(prefix="/alugueres-material", tags=["Alugueres de Material"])

# (GET)    /alugueres-material - Lista todos os alugueres de material.
# (GET)    /alugueres-material/condomino - Lista os alugueres de material do condómino autenticado.
# (POST)   /alugueres-material - Cria um novo aluguer de material.
# (DELETE) /alugueres-material/{id} - Cancela um aluguer de material.

@router.get("", response_model=List[LerAluguerMaterial])
def listar(_=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar(db)


@router.get("/condomino", response_model=List[LerAluguerMaterial])
def listar_alugueres_pessoais(condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)

@router.post("", response_model=LerAluguerMaterial, status_code=201)
def criar(dados: CriarAluguerMaterial, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.criar(db, dados, condomino.id)


@router.delete("/{id}")
def cancelar(id: int, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    aluguer = db.query(AluguerMaterial).filter(AluguerMaterial.id == id,AluguerMaterial.id_condomino == condomino.id,).first()
    
    if not aluguer:
        raise HTTPException(403, "Sem permissão para cancelar este aluguer.")
    return servico.cancelar(db, id)
