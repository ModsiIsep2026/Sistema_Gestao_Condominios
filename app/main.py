from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.db_connect import get_db
from app.routers import (
    auth, utilizadores, edificios, fracoes, utilizador_fracao,
    quotas, pagamentos, espacos, reservas, avarias,
    ordens_trabalho, despesas, fornecedores, notificacoes, refs, relatorios
)

app = FastAPI(title="Sistema de Gestão de Condomínios")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(utilizadores.router)
app.include_router(edificios.router)
app.include_router(fracoes.router)
app.include_router(utilizador_fracao.router)
app.include_router(quotas.router)
app.include_router(pagamentos.router)
app.include_router(espacos.router)
app.include_router(reservas.router)
app.include_router(avarias.router)
app.include_router(ordens_trabalho.router)
app.include_router(despesas.router)
app.include_router(fornecedores.router)
app.include_router(notificacoes.router)
app.include_router(refs.router)
app.include_router(relatorios.router)


@app.get("/")
def root():
    return {"status": "ok"}
