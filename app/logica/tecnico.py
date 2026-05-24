import secrets
import string
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from app.tabelas_bd.tecnico import Tecnico
from app.configs.seguranca import pw_encript
from app.configs.email import enviar_email

log = logging.getLogger(__name__)


def criar_pw_temp() -> str:
    alfabeto = string.ascii_letters + string.digits
    while True:
        pw = "".join(secrets.choice(alfabeto) for _ in range(10))
        if any(c.isupper() for c in pw) and any(c.isdigit() for c in pw):
            return pw


def notificacao(email_destino: str, nome: str, pw_temp: str) -> None:

    try:
        email_bv(email_destino, nome, pw_temp)
        log.info("Email de boas-vindas enviado para técnico %s", email_destino)
    except Exception as exc:
        log.error("Falha ao enviar email para técnico %s: %s", email_destino, exc)


def email_bv(email_destino: str, nome: str, pw_temp: str) -> None:
    corpo_html = f"""
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0B2240;padding:24px 32px;">
        <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">Bem-vindo ao Gestão de Condomínios</p>
      </div>
      <div style="background:#F4F3F1;padding:32px;">
        <p style="font-size:15px;color:#1A1A1A;margin:0 0 16px;">Olá, <strong>{nome}</strong>!</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">
          A sua conta de <strong>técnico</strong> foi criada. Utilize as credenciais abaixo para entrar:
        </p>
        <div style="background:#fff;border:1px solid #E2E0DC;border-radius:6px;padding:16px 20px;margin:16px 0;">
          <p style="margin:0 0 6px;font-size:13px;color:#6B6860;">Email</p>
          <p style="margin:0 0 14px;font-size:15px;font-weight:700;">{email_destino}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6B6860;">Password temporária</p>
          <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:2px;color:#0B2240;">{pw_temp}</p>
        </div>
        <p style="font-size:13px;color:#6B6860;margin:0;">
          Por segurança, altere a sua password após o primeiro acesso em <strong>A minha conta → Alterar password</strong>.
        </p>
      </div>
      <div style="background:#E2E0DC;padding:12px 32px;">
        <p style="font-size:11px;color:#6B6860;margin:0;">
          © 2026 Sistema de Gestão de Condomínios — Email gerado automaticamente.
        </p>
      </div>
    </div>
    """
    enviar_email(email_destino, "As suas credenciais de acesso — Gestão de Condomínios", corpo_html)


def listar(db: Session, id_gestor: int):
    return db.query(Tecnico).filter(Tecnico.id_gestor == id_gestor, Tecnico.status == 1).all()


def obter(db: Session, id: int):
    tecnico = db.query(Tecnico).filter(Tecnico.id == id, Tecnico.status == 1).first()
    if not tecnico:
        raise HTTPException(404, "Técnico não encontrado")
    return tecnico


def criar(db: Session, dados, id_gestor: int, background: BackgroundTasks = None):
    pw_temp = criar_pw_temp()
    tecnico = Tecnico(
        nome=dados.nome,
        funcao=dados.funcao,
        email=dados.email,
        pw=pw_encript(pw_temp),
        id_gestor=id_gestor,
    )
    db.add(tecnico)
    db.commit()
    db.refresh(tecnico)


    if background is not None:
        background.add_task(notificacao, tecnico.email, tecnico.nome, pw_temp)
    else:
        notificacao(tecnico.email, tecnico.nome, pw_temp)

    return tecnico


def atualizar(db: Session, id: int, dados):
    tecnico = db.query(Tecnico).filter(Tecnico.id == id).first()
    if not tecnico:
        raise HTTPException(404, "Técnico não encontrado")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(tecnico, campo, valor)

    db.commit()
    db.refresh(tecnico)
    return tecnico


def remover(db: Session, id: int):
    tecnico = obter(db, id)
    tecnico.status = 0
    db.commit()
    return {"detalhe": "Técnico removido"}
