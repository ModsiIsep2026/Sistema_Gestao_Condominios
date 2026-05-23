import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.configs.config import get_configs
from app.estruturas.contacto import MensagemContacto

_cfg = get_configs()

DESTINO = "sgc2026i@gmail.com"


def enviar_contacto(dados: MensagemContacto) -> None:

    telefone_linha = f"<tr><td style='padding:4px 0;color:#6B6860;font-size:13px;'>Telefone</td><td style='padding:4px 0;font-size:13px;'>{dados.telefone}</td></tr>" if dados.telefone else ""

    corpo_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:18px;font-weight:600;margin:0;">
          Nova mensagem de contacto
        </p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6B6860;font-size:13px;width:110px;">Nome</td>
            <td style="padding:4px 0;font-size:13px;">{dados.nome}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6B6860;font-size:13px;">Email</td>
            <td style="padding:4px 0;font-size:13px;">
              <a href="mailto:{dados.email}" style="color:#F08A24;">{dados.email}</a>
            </td>
          </tr>
          {telefone_linha}
        </table>
        <hr style="border:none;border-top:1px solid #E2E0DC;margin:20px 0;">
        <p style="font-size:13px;color:#6B6860;margin:0 0 8px;">Mensagem</p>
        <p style="font-size:14px;color:#1A1A1A;white-space:pre-wrap;margin:0;">{dados.mensagem}</p>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">
          Enviado pelo formulário de contacto — Sistema de Gestão de Condomínios
        </p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[Contacto SGC] {dados.nome}"
    msg["From"]    = f"{_cfg.SMTP_FROM_NAME} <{_cfg.SMTP_FROM_EMAIL}>"
    msg["To"]      = DESTINO
    msg["Reply-To"] = dados.email

    msg.attach(MIMEText(corpo_html, "html", "utf-8"))

    with smtplib.SMTP(_cfg.SMTP_HOST, _cfg.SMTP_PORT) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(_cfg.SMTP_USER, _cfg.SMTP_PASSWORD)
        smtp.sendmail(_cfg.SMTP_FROM_EMAIL, DESTINO, msg.as_string())
