from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path

from app.core.config import get_configs
from app.core.seguranca import utilizador_atual
from app.routers import (
    auth, oauth, utilizadores, edificios, fracoes, utilizador_fracao,
    quotas, pagamentos, espacos, reservas, avarias,
    ordens_trabalho, despesas, fornecedores, notificacoes, refs, relatorios,
    gestor_edificio,
)
from starlette.middleware.sessions import SessionMiddleware

_configs = get_configs()

#  Docs da API apenas em desenvolvimento — em prod vamos eliminar 
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
app.add_middleware(SessionMiddleware, secret_key=_configs.APP_SECRET_KEY, same_site="lax", https_only=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  
    allow_headers=["Authorization", "Content-Type"],          
)



@app.exception_handler(Exception)
async def e_sv(request: Request, exc: Exception):
    
    return JSONResponse(status_code=500, content={"detalhe": "Erro interno do servidor"})


_auth_required = [Depends(utilizador_atual)]

app.include_router(auth.router)
app.include_router(oauth.router)
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
app.include_router(gestor_edificio.router, dependencies=_auth_required)


_frontend = Path(__file__).resolve().parent.parent / "frontend"

app.mount("/shared",    StaticFiles(directory=_frontend / "shared"),                  name="shared")
app.mount("/website_C", StaticFiles(directory=_frontend / "website_C", html=True),    name="website_C")
app.mount("/webapp_AG", StaticFiles(directory=_frontend / "webapp_AG", html=True),    name="webapp_AG")


@app.get("/", include_in_schema=False)
def raiz():
    return RedirectResponse(url="/website_C/")
