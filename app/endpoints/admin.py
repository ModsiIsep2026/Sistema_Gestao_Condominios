from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db_connect import get_db
from app.core.seguranca import so_admin
from app.schemas.admin import LerAdmin, AtualizarAdmin
from app.services import admin as servico

router = APIRouter(prefix="/admin", tags=["Admin"])

# (GET) /admin/me      - Perfil do admin autenticado
# (PUT) /admin/me      - Atualiza perfil do admin


@router.get("/me", response_model=LerAdmin)
def perfil(admin=Depends(so_admin)):
    return admin  # so_admin já carrega o objeto da BD


@router.put("/me", response_model=LerAdmin)
def atualizar(dados: AtualizarAdmin, admin=Depends(so_admin), db: Session = Depends(get_db)):
    return servico.atualizar(db, admin.id, dados)
