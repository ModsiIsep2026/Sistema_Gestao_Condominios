from email.message import EmailMessage

import aiosmtplib
from fastapi import HTTPException

from app.core.config import get_configs


async def enviar_email(destinatario: str, assunto: str, corpo_texto: str, corpo_html: str | None = None):
    configs = get_configs()

    if not configs.SMTP_USER or not configs.SMTP_PASSWORD:
        raise HTTPException(500, "SMTP não configurado")

    mensagem = EmailMessage()
    mensagem["Subject"] = assunto
    mensagem["From"] = f"{configs.SMTP_FROM_NAME} <{configs.SMTP_FROM_EMAIL}>"
    mensagem["To"] = destinatario
    mensagem.set_content(corpo_texto)

    if corpo_html:
        mensagem.add_alternative(corpo_html, subtype="html")

    smtp_kwargs = {
        "hostname": configs.SMTP_HOST,
        "port": configs.SMTP_PORT,
        "username": configs.SMTP_USER,
        "password": configs.SMTP_PASSWORD,
    }

    if configs.SMTP_PORT == 465:
        await aiosmtplib.send(mensagem, use_tls=True, **smtp_kwargs)
    else:
        await aiosmtplib.send(mensagem, start_tls=True, **smtp_kwargs)
