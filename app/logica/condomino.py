import secrets
import string
import logging
import time
from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from app.tabelas_bd.condomino import Condomino
from app.configs.seguranca import pw_encript
from app.configs.email import enviar_email

log = logging.getLogger(__name__)


def criar_pw_temp() -> str:

    alfabeto = string.ascii_letters + string.digits
    while True:
        pw = "".join(secrets.choice(alfabeto) for _ in range(10))
        if any(c.isupper() for c in pw) and any(c.isdigit() for c in pw):
            return pw


def notificacao(email_destino: str, nome: str, pw_temp: str, perfil: str) -> None:
    try:
        email_bv(email_destino, nome, pw_temp, perfil)
        log.info("Email de boas-vindas enviado para %s (%s)", email_destino, perfil)
    except Exception as exc:
        log.error("Falha ao enviar email para %s: %s", email_destino, exc)


def email_bv(email_destino: str, nome: str, pw_temp: str, perfil: str) -> None:
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


def listar_todos(db: Session):
    return db.query(Condomino).filter(Condomino.status == 1).all()


def listar(db: Session, id_apartamento: int):
    return db.query(Condomino).filter(Condomino.id_apartamento == id_apartamento, Condomino.status == 1).all()


def obter(db: Session, id: int):
    cond = db.query(Condomino).filter(Condomino.id == id, Condomino.status == 1).first()
    if not cond:
        raise HTTPException(404, "Condómino não encontrado")
    return cond


def criar(db: Session, dados, background: BackgroundTasks = None):
    pw_temp = criar_pw_temp()
    # Se o gestor não indicou telemóvel, guarda placeholder temporário único
    tel = dados.telemovel if dados.telemovel else f"_p{int(time.time() * 1000)}"
    condomino = Condomino(
        nome=dados.nome,
        email=dados.email,
        pw=pw_encript(pw_temp),
        telemovel=tel,
        id_apartamento=dados.id_apartamento,
    )
    db.add(condomino)
    db.commit()
    db.refresh(condomino)

    if background is not None:
        background.add_task(notificacao, condomino.email, condomino.nome, pw_temp, "condómino")
    else:
        notificacao(condomino.email, condomino.nome, pw_temp, "condómino")

    return condomino


def atualizar(db: Session, id: int, dados):
    condomino = db.query(Condomino).filter(Condomino.id == id).first()
    if not condomino:
        raise HTTPException(404, "Condómino não encontrado")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(condomino, campo, valor)

    db.commit()
    db.refresh(condomino)
    return condomino


def remover(db: Session, id: int):
    condomino = obter(db, id)
    condomino.status = 0
    db.commit()
    return {"detalhe": "Condómino removido"}
