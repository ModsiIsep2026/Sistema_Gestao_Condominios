import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.configs.config import get_configs

_cfg = get_configs()


def enviar_email(destino: str, assunto: str, corpo_html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = assunto
    msg["From"] = f"{_cfg.SMTP_FROM_NAME} <{_cfg.SMTP_FROM_EMAIL}>"
    msg["To"] = destino
    msg.attach(MIMEText(corpo_html, "html", "utf-8"))

    with smtplib.SMTP(_cfg.SMTP_HOST, _cfg.SMTP_PORT) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(_cfg.SMTP_USER, _cfg.SMTP_PASSWORD)
        smtp.sendmail(_cfg.SMTP_FROM_EMAIL, destino, msg.as_string())


def enviar_boas_vindas(destino: str, nome: str, pw_temp: str, perfil: str) -> None:
    corpo_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">Bem-vindo ao Gestão de Condomínios</p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <p style="font-size:15px;color:#1A1A1A;margin:0 0 16px;">Olá, <strong>{nome}</strong>!</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">
          A sua conta de <strong>{perfil}</strong> foi criada. Utilize as credenciais abaixo para entrar:
        </p>
        <div style="background:#fff;border:1px solid #E2E0DC;border-radius:6px;padding:16px 20px;margin:16px 0;">
          <p style="margin:0 0 6px;font-size:13px;color:#6B6860;">Email</p>
          <p style="margin:0 0 14px;font-size:15px;font-weight:700;">{destino}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6B6860;">Password temporária</p>
          <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:2px;color:#0B2240;">{pw_temp}</p>
        </div>
        <p style="font-size:13px;color:#6B6860;margin:0;">
          Por segurança, altere a sua password após o primeiro acesso em
          <strong>A minha conta → Alterar password</strong>.
        </p>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">
          © 2026 Sistema de Gestão de Condomínios — Email gerado automaticamente.
        </p>
      </div>
    </div>
    """
    enviar_email(destino, "As suas credenciais de acesso — Gestão de Condomínios", corpo_html)
