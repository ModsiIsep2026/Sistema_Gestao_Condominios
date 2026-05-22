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


_BASE_HTML = """\
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ECEEF2;font-family:'Inter',Arial,sans-serif;color:#1A1A1A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEEF2;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <!-- Cabeçalho -->
      <tr>
        <td style="background:#0B2240;padding:28px 32px;text-align:center;">
          <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#F08A24;">Sistema de Gestão de</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:0.01em;">Condomínios</p>
        </td>
      </tr>

      <!-- Barra laranja -->
      <tr><td style="height:4px;background:#F08A24;"></td></tr>

      <!-- Corpo -->
      <tr>
        <td style="padding:36px 32px;">
          {corpo}
        </td>
      </tr>

      <!-- Rodapé -->
      <tr>
        <td style="padding:16px 32px;background:#F8F9FB;border-top:1px solid #E8EAED;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9AA3AF;">Este email foi gerado automaticamente. Por favor não responda.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""


def _html_email(corpo: str) -> str:
    return _BASE_HTML.replace("{corpo}", corpo)


def template_credenciais(nome: str, email: str, password: str, perfil_nome: str, url_login: str) -> tuple[str, str]:
    texto = (
        f"Olá {nome},\n\n"
        f"Foi criada uma conta de {perfil_nome.lower()} para si no Sistema de Gestão de Condomínios.\n\n"
        f"  Email:    {email}\n"
        f"  Password: {password}\n\n"
        f"Aceder em: {url_login}\n\n"
        "Por segurança, altere a sua password após o primeiro acesso.\n\n"
        "— Sistema de Gestão de Condomínios"
    )

    corpo = f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#0B2240;">Olá, {nome}!</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#5A6472;line-height:1.6;">
        A sua conta está criada. Aqui ficam os dados de acesso.
      </p>

      <table style="width:100%;border-collapse:separate;border-spacing:0 8px;margin-bottom:28px;">
        <tr>
          <td style="width:110px;padding:14px 16px;background:#F0F3F7;border-radius:6px 0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9AA3AF;">Email</td>
          <td style="padding:14px 16px;background:#F0F3F7;border-radius:0 6px 6px 0;font-size:14px;color:#0B2240;">{email}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#0B2240;border-radius:6px 0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#F08A24;">Password</td>
          <td style="padding:14px 16px;background:#0B2240;border-radius:0 6px 6px 0;font-size:15px;font-weight:800;color:#FFFFFF;letter-spacing:0.05em;font-family:monospace;">{password}</td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <a href="{url_login}" style="display:inline-block;background:#F08A24;color:#FFFFFF;padding:14px 36px;text-decoration:none;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;border-radius:4px;">Entrar na plataforma</a>
          </td>
        </tr>
      </table>

      <p style="margin:0;padding:14px 16px;background:#F0F3F7;border-radius:6px;font-size:13px;color:#5A6472;line-height:1.6;">
        Depois de entrar, altere a password quando quiser em <strong>A minha conta</strong>.
      </p>"""

    return texto, _html_email(corpo)


def template_reset_pw(nome: str, link: str, minutos: int) -> tuple[str, str]:
    texto = (
        f"Olá {nome},\n\n"
        "Recebemos um pedido de recuperação de password para a sua conta.\n"
        f"Aceda ao link para escolher uma nova password:\n\n{link}\n\n"
        f"Este link é válido durante {minutos} minutos.\n\n"
        "Se não pediu a recuperação, ignore este email.\n"
        "— Sistema de Gestão de Condomínios"
    )

    corpo = f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#0B2240;">Recuperar password</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#5A6472;line-height:1.6;">
        Olá <strong style="color:#0B2240;">{nome}</strong>, recebemos um pedido de recuperação de password para a sua conta.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <a href="{link}" style="display:inline-block;background:#F08A24;color:#FFFFFF;padding:14px 36px;text-decoration:none;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;border-radius:4px;">Redefinir password</a>
          </td>
        </tr>
      </table>

      <p style="margin:0;padding:14px 16px;background:#F0F3F7;border-radius:6px;font-size:13px;color:#5A6472;line-height:1.6;">
        Este link expira em <strong>{minutos} minutos</strong>. Se não pediu a recuperação, ignore este email.
      </p>"""

    return texto, _html_email(corpo)
