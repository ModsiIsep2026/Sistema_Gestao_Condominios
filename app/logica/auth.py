from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.admin import Admin
from app.tabelas_bd.gestor import Gestor
from app.tabelas_bd.condomino import Condomino
from app.tabelas_bd.tecnico import Tecnico
from app.configs.seguranca import verificar_pw

PERFIS = {
    "admin":     Admin,
    "gestor":    Gestor,
    "condomino": Condomino,
    "tecnico":   Tecnico,
}


def autenticar(db: Session, email: str, pw: str, tipo: str):
    tipo_perfil = PERFIS[tipo]
    utilizador = db.query(tipo_perfil).filter(tipo_perfil.email == email, tipo_perfil.status == 1).first()
    if not utilizador or not verificar_pw(pw, utilizador.pw):
        raise HTTPException(401, "Email ou password inválidos")
    return utilizador



# Procura o utilizador em todos os perfis do sistema (admin, gestor, condómino, técnico).
# Se encontrar um utilizador com o email fornecido e a password correta,
# autentica-o e devolve o utilizador juntamente com o tipo de perfil.
def autenticar_auto(db: Session, email: str, pw: str):
    for tipo, tipo_perfil in PERFIS.items():
        u = db.query(tipo_perfil).filter(tipo_perfil.email == email, tipo_perfil.status == 1).first()
        if u and verificar_pw(pw, u.pw):
            return u, tipo
    raise HTTPException(401, "Email ou password inválidos")
