from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_a, verificar_g
from app.estruturas.gestor import CriarGestor, AtualizarGestor, LerGestor
from app.logica import gestor as servico

router = APIRouter(prefix="/gestores", tags=["Gestores"])

# (GET)    /gestores              - Lista todos os gestores (admin).
# (GET)    /gestores/adesoes      - Estatísticas de novas adesões por dia (admin).
# (GET)    /gestores/{id}         - Mostra os dados de um gestor específico (admin).
# (POST)   /gestores              - Cria um gestor manualmente (admin).
# (PUT)    /gestores/conta        - Atualiza o perfil do gestor autenticado.
# (PUT)    /gestores/{id}         - Atualiza um gestor (admin).
# (DELETE) /gestores/{id}         - Remove um gestor (admin).

@router.get("", response_model=List[LerGestor])
def listar(_=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.listar_todos(db)


@router.put("/conta", response_model=LerGestor)
def atualizar_pperfil(dados: AtualizarGestor, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, gestor.id, dados)


@router.get("/adesoes")
def adesoes(dias: int = Query(default=30, ge=1, le=365),_=Depends(verificar_a),db: Session = Depends(get_db),):
    return servico.adesoes_por_dia(db, dias)


@router.get("/{id}", response_model=LerGestor)
def obter(id: int, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerGestor, status_code=201)
def criar(dados: CriarGestor, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.criar(db, dados)


@router.put("/{id}", response_model=LerGestor)
def atualizar(id: int, dados: AtualizarGestor, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.remover(db, id)
