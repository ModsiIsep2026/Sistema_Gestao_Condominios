from urllib.parse import quote

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.configs.config import get_configs
from app.configs.db_connect import get_db
from app.configs.seguranca import criar_token
from app.tabelas_bd.condomino import Condomino
from app.tabelas_bd.gestor import Gestor
from app.tabelas_bd.tecnico import Tecnico

router = APIRouter(prefix="/auth", tags=["Gmail"])
cfg    = get_configs()

# (GET) /auth/google/inicio  - Inicia o login através do Google
# (GET) /auth/google/callback - Finaliza o login do Google

# "google" é o nome público; o cliente OAuth está registado como "gmail"
SERVICES = {"gmail", "google"}
_OAUTH_CLIENT = "gmail"


try:
    from authlib.integrations.starlette_client import OAuth, OAuthError

    oauth = OAuth()

    if cfg.GOOGLE_CLIENT_ID and cfg.GOOGLE_CLIENT_SECRET:
        oauth.register(
            name="gmail",
            client_id=cfg.GOOGLE_CLIENT_ID,
            client_secret=cfg.GOOGLE_CLIENT_SECRET,
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )

    active_services = set(oauth._clients.keys())
    oauth_enabled   = True

except ImportError:
    oauth           = None
    active_services = set()
    oauth_enabled   = False



def _base() -> str:
    return cfg.FRONTEND_BASE or ""

def redirect_login(token: str) -> RedirectResponse:
    return RedirectResponse(f"{_base()}/web_app_visitante/login.html#token={token}")


def redirect_register(email: str, msg: str = "") -> RedirectResponse:
    url = f"{_base()}/web_app_visitante/registo_gestor.html?email={quote(email)}"
    if msg:
        url += f"&aviso={quote(msg)}"
    return RedirectResponse(url)

def redirect_error(msg: str) -> RedirectResponse:
    return RedirectResponse(f"{_base()}/web_app_visitante/login.html?erro={quote(msg)}")

def callback_url(service: str) -> str:
    return f"{cfg.OAUTH_REDIRECT_BASE}/auth/{service}/callback"

def get_user(db: Session, email: str):
    user = db.query(Gestor).filter_by(email=email, status=1).first()
    if user:
        return user, "gestor"
    user = db.query(Condomino).filter_by(email=email, status=1).first()
    if user:
        return user, "condomino"
    user = db.query(Tecnico).filter_by(email=email, status=1).first()
    if user:
        return user, "tecnico"
    return None, None


@router.get("/{service}/inicio")
async def login(service: str, request: Request):
    if service not in SERVICES:
        return redirect_error("Serviço inválido")
    if not oauth_enabled or _OAUTH_CLIENT not in active_services:
        return redirect_error("OAuth indisponível")
    return await oauth.create_client(_OAUTH_CLIENT).authorize_redirect(request, callback_url("google"))

@router.get("/{service}/callback")
async def callback(service: str, request: Request, db: Session = Depends(get_db)):
    if service not in SERVICES:
        return redirect_error("Serviço inválido")
    if not oauth_enabled:
        return redirect_error("OAuth indisponível")

    try:
        token = await oauth.create_client(_OAUTH_CLIENT).authorize_access_token(request)
    except OAuthError:
        return redirect_error("Falha no login Google")

    client = oauth.create_client(_OAUTH_CLIENT)
    info = token.get("userinfo") or await client.userinfo(token=token)
    email = info.get("email")

    if not email:
        return redirect_error("Email não encontrado")

    user, role = get_user(db, email)
    if not user:
        return redirect_error("Conta não encontrada. Contacte o seu gestor.")

    return redirect_login(criar_token(user.id, role))
