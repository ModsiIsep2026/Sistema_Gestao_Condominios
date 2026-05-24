from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pathlib import Path

from app.configs.config import get_configs
from app.endpoints import (
    auth, oauth, admin, licencas, gestores, contratos,
    edificios, apartamentos, condominos, tecnicos,
    parceiros, espacos, materiais,
    alugueres_espaco, alugueres_material,
    pagamentos, avarias, relatorios, contacto,
)

_configs = get_configs()

app = FastAPI(
    title="Sistema de Gestão de Condomínios",
    docs_url="/docs"      if _configs.APP_ENV == "development" else None,
    redoc_url="/redoc"    if _configs.APP_ENV == "development" else None,
    openapi_url="/openapi.json" if _configs.APP_ENV == "development" else None,
)




class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"]  = "nosniff"                                 # Proteção contra MIME sniffing
        response.headers["X-Frame-Options"]         = "DENY"                                      # Proteção contra clickjacking
        response.headers["X-XSS-Protection"]        = "1; mode=block"                           # Proteção contra XSS
        response.headers["Referrer-Policy"]         = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"]           = "no-store"                                    # Evita cache de dados sensíveis
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SessionMiddleware, secret_key=_configs.APP_SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],)


# Endpoints

app.include_router(auth.router)
app.include_router(oauth.router)           
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
app.include_router(relatorios.router)
app.include_router(contacto.router)




_frontend = Path(__file__).resolve().parent.parent / "frontend"

app.mount("/shared",    StaticFiles(directory=_frontend / "visuais"),              name="shared")
app.mount("/website_C", StaticFiles(directory=_frontend / "website_C", html=True), name="website_C")
app.mount("/webapp_AG", StaticFiles(directory=_frontend / "webapp_AG", html=True), name="webapp_AG")
app.mount("/webapp_C",  StaticFiles(directory=_frontend / "webapp_C",  html=True), name="webapp_C")


@app.get("/", include_in_schema=False)
def raiz():
    return RedirectResponse(url="/website_C/")
