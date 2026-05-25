import httpx
from urllib.parse import quote
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.configs.db_connect import get_db
from app.configs.config import get_configs
from app.configs.seguranca import criar_token

router = APIRouter(prefix="/auth", tags=["OAuth"])
cfg = get_configs()


# (GET) /auth/{service}/inicio
# Inicia o login através de um serviço externo (Google, GitHub ou Microsoft) e redireciona o utilizador para autenticação.

# (GET) /auth/{service}/callback
# Finaliza o login externo, valida o utilizador e cria sessão no sistema ou encaminha para registo caso não exista conta.
try:
    from authlib.integrations.starlette_client import OAuth, OAuthError

    oauth = OAuth()

    if cfg.GOOGLE_CLIENT_ID and cfg.GOOGLE_CLIENT_SECRET:
        oauth.register(
            name="google",
            client_id=cfg.GOOGLE_CLIENT_ID,
            client_secret=cfg.GOOGLE_CLIENT_SECRET,
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )

    if cfg.GITHUB_CLIENT_ID and cfg.GITHUB_CLIENT_SECRET:
        oauth.register(
            name="github",
            client_id=cfg.GITHUB_CLIENT_ID,
            client_secret=cfg.GITHUB_CLIENT_SECRET,
            access_token_url="https://github.com/login/oauth/access_token",
            authorize_url="https://github.com/login/oauth/authorize",
            api_base_url="https://api.github.com/",
            client_kwargs={"scope": "user:email"},
        )

    if cfg.MICROSOFT_CLIENT_ID and cfg.MICROSOFT_CLIENT_SECRET:
        oauth.register(
            name="microsoft",
            client_id=cfg.MICROSOFT_CLIENT_ID,
            client_secret=cfg.MICROSOFT_CLIENT_SECRET,
            server_metadata_url="https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )

    active_services = set(oauth._clients.keys())
    oauth_enabled = True

except ImportError:
    oauth = None
    active_services = set()
    oauth_enabled = False



def redirect_login(token: str):
    return RedirectResponse(f"/web_app_visitante/login.html#token={token}")


def redirect_register(email: str, msg: str = ""):
    url = f"/web_app_visitante/registo_gestor.html?email={quote(email)}"
    if msg:
        url += f"&aviso={quote(msg)}"
    return RedirectResponse(url)


def redirect_error(msg: str):
    return RedirectResponse(f"/web_app_visitante/login.html?erro={quote(msg)}")


def callback_url(service: str):
    return f"{cfg.OAUTH_REDIRECT_BASE}/auth/{service}/callback"


def get_user(db: Session, email: str):
    from app.tabelas_bd.condomino import Condomino
    from app.tabelas_bd.gestor import Gestor

    user = db.query(Condomino).filter_by(email=email, status=1).first()
    if user:
        return user, "condomino"

    user = db.query(Gestor).filter_by(email=email, status=1).first()
    if user:
        return user, "gestor"

    return None, None


async def get_email(service: str, token: dict):
    if service in ("google", "microsoft"):
        client = oauth.create_client(service)
        info = token.get("userinfo") or await client.userinfo(token=token)
        return info.get("email"), info.get("name")

    if service == "github":
        headers = {"Authorization": f"Bearer {token['access_token']}"}

        async with httpx.AsyncClient() as http:
            user = (await http.get("https://api.github.com/user", headers=headers)).json()

            email = user.get("email")
            name = user.get("name") or user.get("login")

            if not email:
                emails = (await http.get("https://api.github.com/user/emails", headers=headers)).json()
                primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                email = primary["email"] if primary else (emails[0]["email"] if emails else None)

        return email, name

    return None, None


SERVICES = {"google", "github", "microsoft"}


@router.get("/{service}/inicio")
async def login(service: str, request: Request):
    if service not in SERVICES:
        return redirect_error("Serviço inválido")

    if not oauth_enabled or service not in active_services:
        return redirect_error("OAuth indisponível")

    client = oauth.create_client(service)
    return await client.authorize_redirect(request, callback_url(service))


@router.get("/{service}/callback")
async def callback(service: str, request: Request, db: Session = Depends(get_db)):
    if not oauth_enabled or service not in active_services:
        return redirect_error("Serviço indisponível")

    client = oauth.create_client(service)

    try:
        token = await client.authorize_access_token(request)
    except OAuthError:
        return redirect_error("Falha no login")

    email, _ = await get_email(service, token)

    if not email:
        return redirect_error("Email não encontrado")

    user, role = get_user(db, email)

    if not user:
        return redirect_register(email, "Conta não existe")

    jwt = criar_token(user.id, role)
    return redirect_login(jwt)
