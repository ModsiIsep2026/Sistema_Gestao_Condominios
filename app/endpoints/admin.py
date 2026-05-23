from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_a
from app.estruturas.admin import LerAdmin, AtualizarAdmin
from app.logica import admin as servico

router = APIRouter(prefix="/admin", tags=["Admin"])

# (GET) /admin  - Perfil do admin autenticado
# (PUT) /admin  - Atualiza perfil do admin


@router.get("", response_model=LerAdmin)
def perfil(admin=Depends(verificar_a)):
    return admin


@router.put("", response_model=LerAdmin)

def atualizar(dados: AtualizarAdmin, admin=Depends(verificar_a), db: Session = Depends(get_db)):
    return servico.atualizar(db, admin.id, dados)
