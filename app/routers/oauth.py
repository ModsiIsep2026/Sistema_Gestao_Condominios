"""
OAuth — login com Google, GitHub e Microsoft (Outlook).

Fluxo:
  1. Frontend redireciona para GET /auth/{provedor}/inicio
  2. Backend redireciona para a página de autorização do provedor
  3. Provedor redireciona de volta para GET /auth/{provedor}/callback
  4. Backend troca o code por um access_token e obtém o email do utilizador
  5. Se o email já existe em 'utilizador' -> faz login (gera JWT)
     Se não existe -> cria conta de condómino e faz login (gera JWT)
  6. Backend redireciona para o frontend com o JWT no fragment da URL

Para ativar cada provedor, preencher os pares CLIENT_ID/CLIENT_SECRET no .env.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
import httpx

from app.core.db_connect import get_db
from app.core.config import get_configs
from app.core.seguranca import criar_token, hash_password
from app.models.utilizador import Utilizador
from app.services.utilizador import obter_por_email
from app.services.auth import _registar_log, PERFIL_CONDOMINO
import secrets

router = APIRouter(prefix="/auth", tags=["OAuth"])

_configs = get_configs()
oauth = OAuth()

# Google ----------------------------------------------------------------------
if _configs.GOOGLE_CLIENT_ID and _configs.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=_configs.GOOGLE_CLIENT_ID,
        client_secret=_configs.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

# GitHub ----------------------------------------------------------------------
if _configs.GITHUB_CLIENT_ID and _configs.GITHUB_CLIENT_SECRET:
    oauth.register(
        name="github",
        client_id=_configs.GITHUB_CLIENT_ID,
        client_secret=_configs.GITHUB_CLIENT_SECRET,
        access_token_url="https://github.com/login/oauth/access_token",
        authorize_url="https://github.com/login/oauth/authorize",
        api_base_url="https://api.github.com/",
        client_kwargs={"scope": "user:email"},
    )

# Microsoft (Outlook) ---------------------------------------------------------
if _configs.MICROSOFT_CLIENT_ID and _configs.MICROSOFT_CLIENT_SECRET:
    oauth.register(
        name="microsoft",
        client_id=_configs.MICROSOFT_CLIENT_ID,
        client_secret=_configs.MICROSOFT_CLIENT_SECRET,
        server_metadata_url="https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

PROVEDORES_ATIVOS = {p.name for p in oauth._clients.values()} if hasattr(oauth, "_clients") else set()


def _redirect_uri(request: Request, provedor: str) -> str:
    return f"{_configs.OAUTH_REDIRECT_BASE}/auth/{provedor}/callback"


def _redireciona_frontend_com_token(token: str) -> RedirectResponse:
    # Token vai no fragment (#) — não é enviado ao servidor, fica só no browser
    url = f"/website_C/login.html#token={token}"
    return RedirectResponse(url=url)


def _redireciona_frontend_com_erro(mensagem: str) -> RedirectResponse:
    from urllib.parse import quote
    url = f"/website_C/login.html?erro={quote(mensagem)}"
    return RedirectResponse(url=url)


def _criar_ou_obter_utilizador(db: Session, email: str, nome: str, ip: str, provedor: str) -> Utilizador:
    """Procura o utilizador pelo email. Se não existir, cria conta de condómino."""
    utilizador = obter_por_email(db, email)

    if utilizador:
        _registar_log(db, acao=f"login_{provedor}", resultado="sucesso",
                      utilizador_id=utilizador.id_utilizador, ip=ip)
        return utilizador

    # Cria conta nova de condómino com password aleatória (o utilizador autentica via OAuth)
    password_aleatoria = secrets.token_urlsafe(32)
    utilizador = Utilizador(
        perfil_id=PERFIL_CONDOMINO,
        nome=nome or email.split("@")[0],
        email=email,
        password_hash=hash_password(password_aleatoria),
        lingua="pt",
        status=1,
    )
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)

    _registar_log(db, acao=f"registo_{provedor}", resultado="sucesso",
                  utilizador_id=utilizador.id_utilizador, ip=ip)
    return utilizador


@router.get("/{provedor}/inicio")
async def oauth_inicio(provedor: str, request: Request):
    if provedor not in {"google", "github", "microsoft"}:
        raise HTTPException(404, "Provedor desconhecido.")
    if provedor not in PROVEDORES_ATIVOS:
        return _redireciona_frontend_com_erro(f"Login com {provedor} ainda não está configurado.")

    cliente = oauth.create_client(provedor)
    return await cliente.authorize_redirect(request, _redirect_uri(request, provedor))


@router.get("/{provedor}/callback")
async def oauth_callback(provedor: str, request: Request, db: Session = Depends(get_db)):
    if provedor not in PROVEDORES_ATIVOS:
        return _redireciona_frontend_com_erro(f"Provedor {provedor} indisponível.")

    cliente = oauth.create_client(provedor)
    ip = request.client.host if request.client else None

    try:
        token = await cliente.authorize_access_token(request)
    except OAuthError as e:
        return _redireciona_frontend_com_erro(f"Falha na autenticação: {e.description or e.error}")

    # Obter email e nome consoante o provedor
    email = None
    nome = None

    if provedor in ("google", "microsoft"):
        info = token.get("userinfo") or await cliente.userinfo(token=token)
        email = (info or {}).get("email")
        nome = (info or {}).get("name")

    elif provedor == "github":
        # Tenta obter o email principal (pode ser privado)
        async with httpx.AsyncClient() as http:
            headers = {"Authorization": f"Bearer {token['access_token']}"}
            user_resp = await http.get("https://api.github.com/user", headers=headers)
            user_data = user_resp.json() if user_resp.status_code == 200 else {}
            nome = user_data.get("name") or user_data.get("login")
            email = user_data.get("email")

            if not email:
                emails_resp = await http.get("https://api.github.com/user/emails", headers=headers)
                if emails_resp.status_code == 200:
                    emails = emails_resp.json()
                    principal = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                    email = principal["email"] if principal else (emails[0]["email"] if emails else None)

    if not email:
        return _redireciona_frontend_com_erro("Não foi possível obter o email da conta.")

    utilizador = _criar_ou_obter_utilizador(db, email=email, nome=nome, ip=ip, provedor=provedor)
    jwt_token = criar_token({"sub": str(utilizador.id_utilizador), "perfil": utilizador.perfil_id})
    return _redireciona_frontend_com_token(jwt_token)
