import stripe
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import date, timedelta

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.configs.config import get_configs
from app.configs.seguranca import pw_encript, random_pw
from app.tabelas_bd.contrato import Contrato
from app.tabelas_bd.licenca import Licenca
from app.tabelas_bd.gestor import Gestor

_cfg = get_configs()


def _stripe():
    stripe.api_key = _cfg.STRIPE_SECRET_KEY
    return stripe



def listar(db: Session):
    return db.query(Contrato).filter(Contrato.status == 1).all()


def obter_pgestor(db: Session, id_gestor: int):
    contrato = db.query(Contrato).filter(
        Contrato.id_gestor == id_gestor, Contrato.status == 1
    ).first()
    if not contrato:
        raise HTTPException(404, "Contrato não encontrado")
    return contrato


def criar(db: Session, dados):
    contrato = Contrato(**dados.model_dump())
    db.add(contrato)
    db.commit()
    db.refresh(contrato)
    return contrato


def atualizar(db: Session, id_gestor: int, dados):
    contrato = obter_pgestor(db, id_gestor)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(contrato, campo, valor)
    db.commit()
    db.refresh(contrato)
    return contrato




def iniciar_pagamento(db: Session, dados) -> dict:


    licenca = db.query(Licenca).filter(
        Licenca.id == dados.id_licenca, Licenca.status == 1
    ).first()
    if not licenca:
        raise HTTPException(404, "Licença não encontrada.")

    # Verificar email duplicado antes de cobrar
    if db.query(Gestor).filter(Gestor.email == dados.email).first():
        raise HTTPException(409, "Este email já está registado na plataforma.")

    num_meses = max(1, dados.num_meses)

    # Preço mensal = ppem × num_edificios (limite do plano)
    preco_mensal = max(50, int(float(licenca.ppem) * licenca.num_edificios * 100))
    # Total = mensal × meses contratados
    preco_total  = preco_mensal * num_meses

    s = _stripe()
    intent = s.PaymentIntent.create(
        amount=preco_total,
        currency="eur",
        metadata={
            "nome":       dados.nome,
            "email":      dados.email,
            "telemovel":  dados.telemovel,
            "nif":        dados.nif or "",
            "id_licenca": str(dados.id_licenca),
            "num_meses":  str(num_meses),
        },
    )

    return {
        "client_secret":         intent.client_secret,
        "publishable_key":       _cfg.STRIPE_PUBLISHABLE_KEY,
        "preco_centimos":        preco_total,
        "preco_mensal_centimos": preco_mensal,
        "num_meses":             num_meses,
        # Devolve o limite de edifícios do plano escolhido
        "num_edificios_limite":  licenca.num_edificios,
    }


def concluir_pagamento(db: Session, dados) -> dict:


    s = _stripe()
    try:
        intent = s.PaymentIntent.retrieve(dados.payment_intent_id)
    except Exception:
        raise HTTPException(400, "Pagamento não encontrado.")

    if intent.status != "succeeded":
        raise HTTPException(400, "O pagamento ainda não foi confirmado pelo Stripe.")

    # Verificar email duplicado
    if db.query(Gestor).filter(Gestor.email == dados.email).first():
        raise HTTPException(409, "Este email já tem conta criada.")

    licenca = db.query(Licenca).filter(
        Licenca.id == dados.id_licenca, Licenca.status == 1
    ).first()
    if not licenca:
        raise HTTPException(404, "Licença não encontrada.")

    num_meses = max(1, dados.num_meses)

    # Criar gestor com password temporária
    pw_temp = random_pw(12)
    gestor = Gestor(
        nome=dados.nome,
        email=dados.email,
        telemovel=dados.telemovel,
        pw=pw_encript(pw_temp),
    )
    db.add(gestor)
    db.flush()  # obter o ID antes do commit

    # Criar contrato — data_fim respeita os meses contratados
    hoje = date.today()
    contrato = Contrato(
        id_licenca=dados.id_licenca,
        id_gestor=gestor.id,
        data_inicio=hoje,
        data_fim=hoje + timedelta(days=30 * num_meses),
    )
    db.add(contrato)
    db.commit()

    # Enviar email com password temporária 
    try:
        _enviar_boas_vindas(dados.email, dados.nome, pw_temp, licenca.num_edificios, num_meses)
    except Exception:
        pass

    return {"email": dados.email}




def _enviar_boas_vindas(
    email_destino: str, nome: str, pw_temporaria: str,
    num_edificios: int, num_meses: int
) -> None:

    corpo_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:20px;font-weight:700;margin:0;">
          Bem-vindo ao Sistema de Gestão de Condomínios
        </p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <p style="font-size:15px;color:#1A1A1A;margin:0 0 20px;">Olá, <strong>{nome}</strong>!</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 16px;">
          A sua conta de gestor foi criada com sucesso.
          O seu plano permite gerir até <strong>{num_edificios} edifício{'s' if num_edificios > 1 else ''}</strong>
          durante <strong>{num_meses} {'meses' if num_meses > 1 else 'mês'}</strong>.
        </p>
        <div style="background:#fff;border:1px solid #E2E0DC;border-radius:6px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:13px;color:#6B6860;">Email de acesso</p>
          <p style="margin:0 0 20px;font-size:15px;font-weight:600;color:#1A1A1A;">{email_destino}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#6B6860;">Password temporária</p>
          <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:4px;color:#0B2240;font-family:monospace;">{pw_temporaria}</p>
        </div>
        <p style="font-size:13px;color:#6B6860;margin:0 0 20px;">
          Por segurança, altere a sua password após o primeiro acesso em
          <strong>Perfil → Alterar Password</strong>.
        </p>
        <a href="http://localhost:8000/website_C/login.html"
           style="display:inline-block;background:#F08A24;color:#fff;padding:12px 24px;
                  font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;">
          Aceder à plataforma
        </a>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">
          © 2026 Sistema de Gestão de Condomínios — Email gerado automaticamente.
        </p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "As suas credenciais de acesso — Gestão de Condomínios"
    msg["From"]    = f"{_cfg.SMTP_FROM_NAME} <{_cfg.SMTP_FROM_EMAIL}>"
    msg["To"]      = email_destino
    msg.attach(MIMEText(corpo_html, "html", "utf-8"))

    with smtplib.SMTP(_cfg.SMTP_HOST, _cfg.SMTP_PORT) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(_cfg.SMTP_USER, _cfg.SMTP_PASSWORD)
        smtp.sendmail(_cfg.SMTP_FROM_EMAIL, email_destino, msg.as_string())
