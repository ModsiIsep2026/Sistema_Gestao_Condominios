from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, verificar_c
from app.estruturas.condomino import CriarCondomino, AtualizarCondomino, LerCondomino
from app.logica import condomino as servico

router = APIRouter(prefix="/condominos", tags=["Condóminos"])

# (GET)    /condominos            - Lista todos os condóminos, ou filtra por apartamento.
# (GET)    /condominos/{id}       - Mostra os dados de um condómino.
# (POST)   /condominos            - Cria um condómino e envia as credenciais por email.
# (PUT)    /condominos/conta      - Atualiza o perfil do condómino autenticado.
# (PUT)    /condominos/{id}       - Atualiza os dados de um condómino (gestor).
# (DELETE) /condominos/{id}       - Remove um condómino (gestor).

@router.get("", response_model=List[LerCondomino])
def listar(id_apartamento: Optional[int] = None, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.listar_todos(db) if id_apartamento is None else servico.listar(db, id_apartamento)


@router.put("/conta", response_model=LerCondomino)
def atualizar_perfil(dados: AtualizarCondomino, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.atualizar(db, condomino.id, dados)


@router.get("/{id}", response_model=LerCondomino)
def obter(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.obter(db, id)


@router.post("", response_model=LerCondomino, status_code=201)
def criar(dados: CriarCondomino, background: BackgroundTasks, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.criar(db, dados, background)


@router.put("/{id}", response_model=LerCondomino)
def atualizar(id: int, dados: AtualizarCondomino, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.atualizar(db, id, dados)


@router.delete("/{id}")
def remover(id: int, _=Depends(verificar_g), db: Session = Depends(get_db)):
    return servico.remover(db, id)
