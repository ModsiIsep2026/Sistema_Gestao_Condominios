import logging
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pathlib import Path

from app.configs.config import get_configs
from app.endpoints import (
    autenticacao, mfa, admin, licencas, gestores, contratos,
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
        response.headers["X-Content-Type-Options"]  = "nosniff"
        response.headers["X-Frame-Options"]         = "DENY"
        response.headers["X-XSS-Protection"]        = "1; mode=block"
        response.headers["Referrer-Policy"]         = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"]           = "no-store"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://unpkg.com https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.stripe.com; "
            "frame-src https://js.stripe.com; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=(self)"
        if _configs.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SessionMiddleware, secret_key=_configs.APP_SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_configs.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(autenticacao.router)
app.include_router(mfa.router)
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
app.mount("/visuais",          StaticFiles(directory=_frontend / "visuais"),          name="visuais")
app.mount("/web_app_visitante", StaticFiles(directory=_frontend / "web_app_visitante", html=True), name="web_app_visitante")
app.mount("/website_C",        StaticFiles(directory=_frontend / "web_app_visitante", html=True), name="website_C_legacy")
app.mount("/web_app_admin",    StaticFiles(directory=_frontend / "web_app_admin",    html=True), name="web_app_admin")
app.mount("/web_app_gestor",   StaticFiles(directory=_frontend / "web_app_gestor",   html=True), name="web_app_gestor")
app.mount("/web_app_condomino", StaticFiles(directory=_frontend / "web_app_condomino", html=True), name="web_app_condomino")
app.mount("/web_app_tecnico",  StaticFiles(directory=_frontend / "web_app_tecnico",  html=True), name="web_app_tecnico")


@app.get("/", include_in_schema=False)
def pagina_inicial():
    return RedirectResponse(url="/web_app_visitante/")
