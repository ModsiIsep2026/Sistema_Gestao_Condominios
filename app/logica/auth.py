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
    perfis = PERFIS[tipo]
    utilizador = db.query(perfis).filter(perfis.email == email, perfis.status == 1).first()

    if not utilizador or not verificar_pw(pw, utilizador.pw):
        
        raise HTTPException(401, "Email ou password inválidos")
    return utilizador
