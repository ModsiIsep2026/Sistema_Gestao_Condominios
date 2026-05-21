# ISTO NÃO ESTÁ FUNCIONAL AINDA (TRABALHO FUTURO, só fui buscar os headers que são necessários, configurar em prod)
# Se algo estiver mal é porque ainda nada está configurado
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
from urllib.parse import quote
import httpx
import secrets

from app.core.db_connect import get_db
from app.core.config import get_configs
from app.core.seguranca import criar_token, hash_pw
from app.models.utilizador import Utilizador
from app.services.utilizador import obter_por_email
from app.services.auth import log_ok, PERFIL_CONDOMINO


router = APIRouter(prefix="/auth", tags=["OAuth"])

_configs = get_configs()
oauth = OAuth()


# Configuração dos serviços OAuth
SERVICOS_OAUTH = {
    "google": {
        "id_attr": "GOOGLE_CLIENT_ID",
        "secret_attr": "GOOGLE_CLIENT_SECRET",
        "registo": {
            "server_metadata_url": "https://accounts.google.com/.well-known/openid-configuration",
            "client_kwargs": {"scope": "openid email profile"},
        },
    },
    "github": {
        "id_attr": "GITHUB_CLIENT_ID",
        "secret_attr": "GITHUB_CLIENT_SECRET",
        "registo": {
            "access_token_url": "https://github.com/login/oauth/access_token",
            "authorize_url": "https://github.com/login/oauth/authorize",
            "api_base_url": "https://api.github.com/",
            "client_kwargs": {"scope": "user:email"},
        },
    },
    "microsoft": {
        "id_attr": "MICROSOFT_CLIENT_ID",
        "secret_attr": "MICROSOFT_CLIENT_SECRET",
        "registo": {
            "server_metadata_url": "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
            "client_kwargs": {"scope": "openid email profile"},
        },
    },
}

# preencher o Client_id e o client_secret futuramente
def _registar_servicos():
    ativos = set()

    for nome, cfg in SERVICOS_OAUTH.items():

        client_id = getattr(_configs, cfg["id_attr"], "")

        client_secret = getattr(_configs, cfg["secret_attr"], "")

        if client_id and client_secret:

            oauth.register(name=nome, client_id=client_id, client_secret=client_secret, **cfg["registo"])

            ativos.add(nome)
    return ativos


SERVICOS_ATIVOS = _registar_servicos()


def _redirect_uri(servico: str) -> str:
    return f"{_configs.OAUTH_REDIRECT_BASE}/auth/{servico}/callback"


def _frontend_token(token: str) -> RedirectResponse:
    return RedirectResponse(url=f"/website_C/login.html#token={token}")


def _frontend_erro(mensagem: str) -> RedirectResponse:
    return RedirectResponse(url=f"/website_C/login.html?erro={quote(mensagem)}")


def _criar_ou_obter_utilizador(db: Session, email: str, nome: str, ip: str, servico: str) -> Utilizador:
    utilizador = obter_por_email(db, email)

    if utilizador:
        log_ok(db, f"login_{servico}", utilizador.id_utilizador, ip)
        return utilizador

    utilizador = Utilizador(
        perfil_id=PERFIL_CONDOMINO,
        nome=nome or email.split("@")[0],
        email=email,
        password_hash=hash_pw(secrets.token_urlsafe(32)),
        lingua="pt",
        status=1,
    )
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)

    log_ok(db, f"registo_{servico}", utilizador.id_utilizador, ip)
    return utilizador


@router.get("/{servico}/inicio")
async def oauth_inicio(servico: str, request: Request):

    if servico not in SERVICOS_OAUTH:
        raise HTTPException(404, "Serviço desconhecido.")
    if servico not in SERVICOS_ATIVOS:
        return _frontend_erro(f"Login com {servico} ainda não está configurado.")
    cliente = oauth.create_client(servico)
    return await cliente.authorize_redirect(request, _redirect_uri(servico))


@router.get("/{servico}/callback")
async def oauth_callback(servico: str, request: Request, db: Session = Depends(get_db)):
    if servico not in SERVICOS_ATIVOS:
        return _frontend_erro(f"Serviço {servico} indisponível.")

    cliente = oauth.create_client(servico)
    ip = request.client.host if request.client else None

    try:
        token = await cliente.authorize_access_token(request)
    except OAuthError as e:
        return _frontend_erro(f"Falha na autenticação: {e.description or e.error}")

    
    email, nome = None, None

    if servico in ("google", "microsoft"):
        info = token.get("userinfo") or await cliente.userinfo(token=token)
        email = (info or {}).get("email")
        nome = (info or {}).get("name")

    elif servico == "github":
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
        return _frontend_erro("Não foi possível obter o email da conta.")

    utilizador = _criar_ou_obter_utilizador(db, email=email, nome=nome, ip=ip, servico=servico)
    
    jwt_token = criar_token({"sub": str(utilizador.id_utilizador), "perfil": utilizador.perfil_id})
    return _frontend_token(jwt_token)
