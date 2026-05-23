#ainda nao está feito

import httpx
from urllib.parse import quote
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.configs.db_connect import get_db
from app.configs.config import get_configs
from app.configs.seguranca import criar_token

router = APIRouter(prefix="/auth", tags=["OAuth"])

_configs = get_configs()


try:
    from authlib.integrations.starlette_client import OAuth, OAuthError
    _oauth = OAuth()

    if _configs.GOOGLE_CLIENT_ID and _configs.GOOGLE_CLIENT_SECRET:
        _oauth.register(
            name="google",
            client_id=_configs.GOOGLE_CLIENT_ID,
            client_secret=_configs.GOOGLE_CLIENT_SECRET,
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )

    if _configs.GITHUB_CLIENT_ID and _configs.GITHUB_CLIENT_SECRET:
        _oauth.register(
            name="github",
            client_id=_configs.GITHUB_CLIENT_ID,
            client_secret=_configs.GITHUB_CLIENT_SECRET,
            access_token_url="https://github.com/login/oauth/access_token",
            authorize_url="https://github.com/login/oauth/authorize",
            api_base_url="https://api.github.com/",
            client_kwargs={"scope": "user:email"},
        )

    if _configs.MICROSOFT_CLIENT_ID and _configs.MICROSOFT_CLIENT_SECRET:
        _oauth.register(
            name="microsoft",
            client_id=_configs.MICROSOFT_CLIENT_ID,
            client_secret=_configs.MICROSOFT_CLIENT_SECRET,
            server_metadata_url="https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )

    _SERVICOS_ATIVOS = set(getattr(_oauth, "_clients", {}).keys())
    _AUTHLIB_OK = True

except ImportError:
    _oauth = None
    _SERVICOS_ATIVOS = set()
    _AUTHLIB_OK = False


# ── Helpers ────────────────────────────────────────────────────────────────────
def _redirect_uri(request: Request, servico: str) -> str:
    return f"{_configs.OAUTH_REDIRECT_BASE}/auth/{servico}/callback"


def _para_frontend(token: str) -> RedirectResponse:
    return RedirectResponse(url=f"/website_C/login.html#token={token}")


def _para_registo(email: str, motivo: str = "") -> RedirectResponse:
    params = f"?email={quote(email)}"
    if motivo:
        params += f"&aviso={quote(motivo)}"
    return RedirectResponse(url=f"/website_C/registo_gestor.html{params}")


def _para_erro(mensagem: str) -> RedirectResponse:
    return RedirectResponse(url=f"/website_C/login.html?erro={quote(mensagem)}")


async def _obter_email_e_nome(servico: str, token: dict) -> tuple[str | None, str | None]:
    """Extrai email e nome do token conforme o serviço."""
    if servico in ("google", "microsoft"):
        info = token.get("userinfo") or await _oauth.create_client(servico).userinfo(token=token)
        return (info or {}).get("email"), (info or {}).get("name")

    if servico == "github":
        headers = {"Authorization": f"Bearer {token['access_token']}"}
        async with httpx.AsyncClient() as http:
            r = await http.get("https://api.github.com/user", headers=headers)
            user = r.json() if r.status_code == 200 else {}
            nome  = user.get("name") or user.get("login")
            email = user.get("email")
            if not email:
                re = await http.get("https://api.github.com/user/emails", headers=headers)
                if re.status_code == 200:
                    lista = re.json()
                    principal = next((e for e in lista if e.get("primary") and e.get("verified")), None)
                    email = principal["email"] if principal else (lista[0]["email"] if lista else None)
        return email, nome

    return None, None


def _procurar_utilizador(db: Session, email: str):
    """Procura o email nas tabelas condomino e gestor. Devolve (objeto, tipo)."""
    from app.tabelas_bd.condomino import Condomino
    from app.tabelas_bd.gestor import Gestor

    c = db.query(Condomino).filter(Condomino.email == email, Condomino.status == 1).first()
    if c:
        return c, "condomino"

    g = db.query(Gestor).filter(Gestor.email == email, Gestor.status == 1).first()
    if g:
        return g, "gestor"

    return None, None


# ── Endpoints ──────────────────────────────────────────────────────────────────
SERVICOS_VALIDOS = {"google", "github", "microsoft"}


@router.get("/{servico}/inicio")
async def oauth_inicio(servico: str, request: Request):
    if servico not in SERVICOS_VALIDOS:
        return _para_erro("Serviço de login desconhecido.")
    if not _AUTHLIB_OK:
        return _para_erro("OAuth não está disponível (instale authlib).")
    if servico not in _SERVICOS_ATIVOS:
        return _para_erro(f"Login com {servico.capitalize()} ainda não está configurado.")

    cliente = _oauth.create_client(servico)
    return await cliente.authorize_redirect(request, _redirect_uri(request, servico))


@router.get("/{servico}/callback")
async def oauth_callback(servico: str, request: Request, db: Session = Depends(get_db)):
    if not _AUTHLIB_OK or servico not in _SERVICOS_ATIVOS:
        return _para_erro(f"Serviço {servico} indisponível.")

    cliente = _oauth.create_client(servico)
    try:
        token = await cliente.authorize_access_token(request)
    except OAuthError as e:
        return _para_erro(f"Falha na autenticação: {e.description or e.error}")

    email, _nome = await _obter_email_e_nome(servico, token)
    if not email:
        return _para_erro("Não foi possível obter o email da conta.")

    utilizador, tipo = _procurar_utilizador(db, email)

    if not utilizador:
        # Conta não existe → redirecionar para registo com email pré-preenchido
        return _para_registo(
            email,
            motivo=f"Não existe conta associada a {email}. Complete o registo abaixo.",
        )

    jwt = criar_token(utilizador.id, tipo)
    return _para_frontend(jwt)
