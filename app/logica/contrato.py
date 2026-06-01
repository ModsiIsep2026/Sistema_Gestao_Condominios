import stripe
from datetime import date, timedelta

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.configs.config import get_configs
from app.configs.email import enviar_email, enviar_boas_vindas
from app.configs.seguranca import pw_encript, random_pw
from app.tabelas_bd.contrato import Contrato
from app.tabelas_bd.licenca import Licenca
from app.tabelas_bd.gestor import Gestor

cfg = get_configs()


def ver_contrato_expirados(db: Session) -> None:
    hoje = date.today()
    expirados = db.query(Contrato).filter(
        Contrato.status == 1,
        Contrato.data_fim < hoje,
    ).all()
    for c in expirados:
        c.status = 0
        if c.gestor:
            c.gestor.status = 0
    if expirados:
        db.commit()

def stripe_client():
    stripe.api_key = cfg.STRIPE_SECRET_KEY
    return stripe

def get_licenca(db: Session, licenca_id: int):

    licenca = db.query(Licenca).filter(Licenca.id == licenca_id,
        Licenca.status == 1
    ).first()

    if not licenca:
        raise HTTPException(404, "Licença não encontrada")

    return licenca


def email_existe(db: Session, email: str):
    return db.query(Gestor).filter(Gestor.email == email).first()


def get_contrato(db: Session, gestor_id: int):
    contrato = db.query(Contrato).filter(
        Contrato.id_gestor == gestor_id,
        Contrato.status == 1
    ).first()

    if not contrato:
        raise HTTPException(404, "Contrato não encontrado")

    return contrato


def listar(db: Session):
    return db.query(Contrato).filter(Contrato.status == 1).all()


def obter_pgestor(db: Session, gestor_id: int):
    return get_contrato(db, gestor_id)


def criar(db: Session, dados):
    contrato = Contrato(**dados.model_dump())
    db.add(contrato)
    db.commit()
    db.refresh(contrato)
    return contrato


def atualizar(db: Session, gestor_id: int, dados):
    contrato = get_contrato(db, gestor_id)
    
    # Isso percorre os campos enviados em dados que não estão 
    # vazios e atualiza o objeto contrato atribuindo a 
    # cada campo (k) o respetivo valor (v).
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(contrato, k, v)

    db.commit()
    db.refresh(contrato)
    return contrato


def iniciar_pagamento(db: Session, dados):
    licenca = get_licenca(db, dados.id_licenca)
    if email_existe(db, dados.email):
        raise HTTPException(409, "Email já registado")

    meses = max(1, dados.num_meses) # garante que o plano dure pelo menos 1 mês
    #Calcula o preço mensal em cêntimos como ppem × número de edifícios, com um mínimo de 50 cêntimos. 
    preco_mensal = max(50, int(float(licenca.ppem) * licenca.num_edificios * 100))
    total = preco_mensal * meses

    s = stripe_client() 
    intent = s.PaymentIntent.create(
        amount=total,
        currency="eur",
        metadata={
            "nome": dados.nome,
            "email": dados.email,
            "telemovel": dados.telemovel,
            "nif": dados.nif or "",
            "id_licenca": str(dados.id_licenca),
            "num_meses": str(meses),
        },
    )

    return {
        "client_secret": intent.client_secret,
        "publishable_key": cfg.STRIPE_PUBLISHABLE_KEY,
        "preco_centimos": total,
        "preco_mensal_centimos": preco_mensal,
        "num_meses": meses,
        "num_edificios_limite": licenca.num_edificios,
    }



def concluir_pagamento(db: Session, dados):
    s = stripe_client()

    try:
        intent = s.PaymentIntent.retrieve(dados.payment_intent_id)
    except Exception:
        raise HTTPException(400, "Pagamento inválido")

    if intent.status != "succeeded":
        raise HTTPException(400, "Pagamento não confirmado")

    if email_existe(db, dados.email):
        raise HTTPException(409, "Conta já existe")

    licenca = get_licenca(db, dados.id_licenca)
    meses = max(1, dados.num_meses)

    pw_temp = random_pw(12)

    gestor = Gestor(
        nome=dados.nome,
        email=dados.email,
        telemovel=dados.telemovel,
        pw=pw_encript(pw_temp),
    )

    db.add(gestor)
    db.flush() # flush para obter o ID do gestor antes de criar o contrato

    contrato = Contrato(
        id_licenca=dados.id_licenca,
        id_gestor=gestor.id,
        data_inicio=date.today(),
        data_fim=date.today() + timedelta(days=30 * meses),
    )
    db.add(contrato)
    db.commit()

    try:
        _enviar_boas_vindas(dados.email, dados.nome, pw_temp, licenca.num_edificios, meses)
    except Exception:
        pass

    return {"email": dados.email}


def _enviar_boas_vindas(email, nome, pw, edificios, meses):
    enviar_boas_vindas(email, nome, pw, "gestor")
    nota_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">Detalhes do plano contratado</p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">
          O seu plano inclui <strong>{edificios} edifício(s)</strong> durante <strong>{meses} mês(es)</strong>.
        </p>
        <p style="font-size:13px;color:#6B6860;margin:0;">
          Pode gerir os seus edifícios a partir do painel de gestor assim que fizer o primeiro acesso.
        </p>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">
          © 2026 Sistema de Gestão de Condomínios — Email gerado automaticamente.
        </p>
      </div>
    </div>
    """
    enviar_email(email, "O seu plano — Gestão de Condomínios", nota_html)