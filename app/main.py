from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path

from app.core.config import get_configs
from app.endpoints import (
    auth, admin, licencas, gestores, contratos,
    edificios, apartamentos, condominos, tecnicos,
    parceiros, espacos, materiais,
    alugueres_espaco, alugueres_material,
    pagamentos, avarias,
)

_configs = get_configs()

app = FastAPI(
    title="Sistema de Gestão de Condomínios",
    docs_url="/docs"      if _configs.APP_ENV == "development" else None,
    redoc_url="/redoc"    if _configs.APP_ENV == "development" else None,
    openapi_url="/openapi.json" if _configs.APP_ENV == "development" else None,
)


# ── Middlewares ────────────────────────────────────────────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"]  = "nosniff"
        response.headers["X-Frame-Options"]         = "DENY"
        response.headers["X-XSS-Protection"]        = "1; mode=block"
        response.headers["Referrer-Policy"]         = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"]           = "no-store"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)


# Endpoints

app.include_router(auth.router)           
app.include_router(licencas.router)       
app.include_router(parceiros.router)      
app.include_router(admin.router)
app.include_router(gestores.router)
app.include_router(contratos.router)
app.include_router(edificios.router)
app.include_router(apartamentos.router)
app.include_router(condominos.router)
app.include_router(tecnicos.router)
app.include_router(espacos.router)
app.include_router(materiais.router)
app.include_router(alugueres_espaco.router)
app.include_router(alugueres_material.router)
app.include_router(pagamentos.router)
app.include_router(avarias.router)


# Frontend 

_frontend = Path(__file__).resolve().parent.parent / "frontend"

app.mount("/shared",    StaticFiles(directory=_frontend / "shared"),               name="shared")
app.mount("/website_C", StaticFiles(directory=_frontend / "website_C", html=True), name="website_C")
app.mount("/webapp_AG", StaticFiles(directory=_frontend / "webapp_AG", html=True), name="webapp_AG")


@app.get("/", include_in_schema=False)
def raiz():
    return RedirectResponse(url="/website_C/")
