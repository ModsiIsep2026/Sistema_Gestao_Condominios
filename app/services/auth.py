from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.utilizador import obter_por_email
from app.core.seguranca import verificar_password, hash_password
from app.models.log_acesso import LogAcesso
from app.models.utilizador import Utilizador


PERFIL_CONDOMINO = 2 


def _registar_log(db: Session, acao: str, resultado: str, utilizador_id=None, ip: str = None):
    log = LogAcesso(
        utilizador_id=utilizador_id,
        acao=acao,
        timestamp=datetime.utcnow(),
        ip_address=ip,
        resultado=resultado,
    )
    db.add(log)
    db.commit()


def autenticar(db: Session, email: str, password: str, ip: str = None):
    utilizador = obter_por_email(db, email)

    
    if not utilizador or not verificar_password(password, utilizador.password_hash):
        _registar_log(db, acao="login_failed", resultado="falhou", ip=ip)
        raise HTTPException(401, "Email ou password inválidos")

    _registar_log(db, acao="login", resultado="sucesso", utilizador_id=utilizador.id_utilizador, ip=ip)
    return utilizador


def registar_logout(db: Session, utilizador_id: int, ip: str = None):
    _registar_log(db, acao="logout", resultado="sucesso", utilizador_id=utilizador_id, ip=ip)


def registar_condomino(db: Session, dados, ip: str = None):

    if obter_por_email(db, dados.email):
        _registar_log(db, acao="registo_email_duplicado", resultado="falhou", ip=ip)
        raise HTTPException(400, "Já existe uma conta com este email.")

    utilizador = Utilizador(
        perfil_id=PERFIL_CONDOMINO,
        nome=dados.nome.strip(),
        email=dados.email,
        password_hash=hash_password(dados.password),
        telemovel=dados.telemovel,
        nif=dados.nif,
        lingua=dados.lingua,
        status=1,
    )
    db.add(utilizador) # 
    db.commit()                         # Regista novo utilizador na bd
    db.refresh(utilizador)

    _registar_log(db, acao="registo", resultado="sucesso",utilizador_id=utilizador.id_utilizador, ip=ip)
    
    return utilizador