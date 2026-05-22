import stripe
import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_configs
from app.core.seguranca import hash_pw, random_pw
from app.models.utilizador import Utilizador
from app.services.utilizador import obter_por_email
from app.services.email import enviar_email, template_credenciais

PERFIL_GESTOR = 3


def _api_key() -> str:
    configs = get_configs()
    key = configs.STRIPE_SECRET_KEY
    if not key or key.startswith("sk_test_COLOCA"):
        raise HTTPException(500, "Stripe não configurado.")
    return key


def iniciar(db: Session, nome: str, email: str, telemovel, nif) -> dict:
    configs = get_configs()
    api_key = _api_key()

    if obter_por_email(db, email):
        raise HTTPException(400, "Já existe uma conta com este email.")

    stripe.api_key = api_key
    intent = stripe.PaymentIntent.create(
        amount=configs.STRIPE_PRECO_CENTIMOS,
        currency="eur",
        payment_method_types=["card"],
    )

    return {
        "client_secret": intent.client_secret,
        "publishable_key": configs.STRIPE_PUBLISHABLE_KEY,
        "preco_centimos": configs.STRIPE_PRECO_CENTIMOS,
    }


async def _obter_status_pagamento(payment_intent_id: str, api_key: str) -> str:
    """Consulta o Stripe via HTTP direto, sem usar o SDK (evita bug StripeObject.get)."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"https://api.stripe.com/v1/payment_intents/{payment_intent_id}",
            auth=(api_key, ""),
        )
    if resp.status_code != 200:
        raise HTTPException(400, f"Não foi possível verificar o pagamento (HTTP {resp.status_code}).")
    return resp.json().get("status", "")


async def concluir(db: Session, payment_intent_id: str, nome: str, email: str, telemovel, nif) -> dict:
    configs = get_configs()
    api_key = _api_key()

    status = await _obter_status_pagamento(payment_intent_id, api_key)
    if status != "succeeded":
        raise HTTPException(400, f"Pagamento não confirmado (estado: {status})")

    if obter_por_email(db, email):
        raise HTTPException(409, "Esta conta já foi criada.")

    password_temporaria = random_pw(12)
    utilizador = Utilizador(
        perfil_id=PERFIL_GESTOR,
        nome=nome,
        email=email,
        password_hash=hash_pw(password_temporaria),
        telemovel=telemovel,
        nif=nif,
        lingua="pt",
        status=0,
        email_verificado=False,
    )
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)

    url_login = f"{configs.APP_URL.rstrip('/')}/website_C/login.html"
    aviso = None
    try:
        texto, html = template_credenciais(
            nome=utilizador.nome,
            email=utilizador.email,
            password=password_temporaria,
            perfil_nome="Gestor",
            url_login=url_login,
        )
        await enviar_email(
            destinatario=utilizador.email,
            assunto="Bem-vindo — Sistema de Gestão de Condomínios",
            corpo_texto=texto,
            corpo_html=html,
        )
    except Exception as e:
        aviso = str(e)

    return {"sucesso": True, "email": utilizador.email, "aviso_email": aviso}
