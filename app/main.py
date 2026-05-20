from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_configs
from app.core.seguranca import utilizador_atual
from app.routers import (
    auth, utilizadores, edificios, fracoes, utilizador_fracao,
    quotas, pagamentos, espacos, reservas, avarias,
    ordens_trabalho, despesas, fornecedores, notificacoes, refs, relatorios
)

_configs = get_configs()

#  Docs da API apenas em desenvolvimento — em produção não devem estar acessíveis
app = FastAPI(
    title="Sistema de Gestão de Condomínios",
    docs_url="/docs" if _configs.APP_ENV == "development" else None,
    redoc_url="/redoc" if _configs.APP_ENV == "development" else None,
    openapi_url="/openapi.json" if _configs.APP_ENV == "development" else None,
)


# Security headers em todas as respostas (toda a informação na palestra de cibersegurança)
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"                      # Proteção contra MIME sniffing
        response.headers["X-Frame-Options"] = "DENY"                                # Proteção contra clickjacking
        response.headers["X-XSS-Protection"] = "1; mode=block"                      # Proteção contra XSS
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin" #
        response.headers["Cache-Control"] = "no-store"                              # Evita cache de dados sensíveis
        # HSTS apenas com HTTPS — ativar quando o servidor tiver TLS (trabalho futuro)
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains" (trabalho futuro),
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  
    allow_headers=["Authorization", "Content-Type"],          
)



@app.exception_handler(Exception)
async def handler_erro_generico(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detalhe": "Erro interno do servidor"})


_auth_required = [Depends(utilizador_atual)]

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
