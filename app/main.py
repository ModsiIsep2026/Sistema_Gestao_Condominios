from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.seguranca import get_current_user
from app.routers import (
    auth, utilizadores, edificios, fracoes, utilizador_fracao,
    quotas, pagamentos, espacos, reservas, avarias,
    ordens_trabalho, despesas, fornecedores, notificacoes, refs, relatorios
)

app = FastAPI(title="Sistema de Gestão de Condomínios")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_auth_required = [Depends(get_current_user)]

app.include_router(auth.router)
app.include_router(utilizadores.router, dependencies=_auth_required)
app.include_router(edificios.router, dependencies=_auth_required)
app.include_router(fracoes.router, dependencies=_auth_required)
app.include_router(utilizador_fracao.router, dependencies=_auth_required)
app.include_router(quotas.router, dependencies=_auth_required)
app.include_router(pagamentos.router, dependencies=_auth_required)
app.include_router(espacos.router, dependencies=_auth_required)
app.include_router(reservas.router, dependencies=_auth_required)
app.include_router(avarias.router, dependencies=_auth_required)
app.include_router(ordens_trabalho.router, dependencies=_auth_required)
app.include_router(despesas.router, dependencies=_auth_required)
app.include_router(fornecedores.router, dependencies=_auth_required)
app.include_router(notificacoes.router, dependencies=_auth_required)
app.include_router(refs.router, dependencies=_auth_required)
app.include_router(relatorios.router, dependencies=_auth_required)
