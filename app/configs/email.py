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
