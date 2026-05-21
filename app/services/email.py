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


def template_credenciais(nome: str, email: str, password: str, perfil_nome: str, url_login: str) -> tuple[str, str]:
    # isto aqui ainda tenho de validar

    texto = (
        f"Olá {nome},\n\n"
        f"Foi criada uma conta de {perfil_nome.lower()} para si no Sistema de Gestão de Condomínios.\n\n"
        "As suas credenciais:\n"
        f"  Email: {email}\n"
        f"  Password: {password}\n\n"
        "Pode aceder em:\n"
        f"{url_login}\n\n"
        "Por segurança, recomendamos que altere a sua password logo após o primeiro acesso.\n\n"
        "— Sistema de Gestão de Condomínios"
    )

    html = f"""<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:Arial,sans-serif;color:#1A1A1A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background-color:#FFFFFF;border-top:4px solid #F08A24;">
          <tr>
            <td style="padding:24px 32px;background-color:#0B2240;color:#FFFFFF;text-align:center;">
              <h1 style="margin:0;font-size:18px;letter-spacing:0.5px;">Sistema de Gestão de Condomínios</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;color:#0B2240;">A sua conta foi criada</h2>
              <p style="margin:0 0 16px 0;line-height:1.6;">Olá <strong>{nome}</strong>,</p>
              <p style="margin:0 0 24px 0;line-height:1.6;">Foi criada uma conta de <strong>{perfil_nome.lower()}</strong> para si. Estas são as suas credenciais de acesso:</p>

              <table style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
                <tr>
                  <td style="padding:12px 16px;background-color:#F5F5F5;border-left:3px solid #0B2240;font-size:13px;color:#5A5A5A;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;width:120px;">Email</td>
                  <td style="padding:12px 16px;background-color:#F5F5F5;font-family:monospace;font-size:14px;">{email}</td>
                </tr>
                <tr><td style="height:4px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#F5F5F5;border-left:3px solid #F08A24;font-size:13px;color:#5A5A5A;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Password</td>
                  <td style="padding:12px 16px;background-color:#F5F5F5;font-family:monospace;font-size:14px;font-weight:700;color:#0B2240;">{password}</td>
                </tr>
              </table>

              <p style="text-align:center;margin:24px 0;">
                <a href="{url_login}" style="display:inline-block;background-color:#F08A24;color:#FFFFFF;padding:14px 28px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Entrar na plataforma</a>
              </p>

              <p style="margin:24px 0 0 0;padding:16px;background-color:#FBF2E5;border-left:3px solid #F08A24;font-size:13px;color:#1A1A1A;line-height:1.6;">
                <strong>Importante:</strong> Por segurança, recomendamos que altere a sua password logo após o primeiro acesso.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    return texto, html
