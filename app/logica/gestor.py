from datetime import date, timedelta
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.tabelas_bd.gestor import Gestor
from app.tabelas_bd.contrato import Contrato
from app.configs.seguranca import pw_encript


def listar_todos(db: Session):
    gestores = db.query(Gestor).options(joinedload(Gestor.contrato)).all()
    return [
        {
            "id":        g.id,
            "nome":      g.nome.replace("Gestor ", "").strip(),
            "empresa":   g.empresa,
            "telemovel": g.telemovel,
            "email":     g.email,
            "status":    g.status,
            "data_fim":  g.contrato.data_fim if g.contrato else None,
        }
        for g in gestores
    ]


def obter(db: Session, id: int):
    gestor = db.query(Gestor).filter(Gestor.id == id, Gestor.status == 1).first()
    
    if not gestor:
        raise HTTPException(404, "Gestor não encontrado")
    return gestor


def criar(db: Session, dados):
    gestor = Gestor(
        nome=dados.nome,
        empresa=dados.empresa,
        telemovel=dados.telemovel,
        email=dados.email,
        pw=pw_encript(dados.pw),
    )
    db.add(gestor)
    db.commit()
    db.refresh(gestor)
    return gestor


def atualizar(db: Session, id: int, dados):
    gestor = db.query(Gestor).filter(Gestor.id == id, Gestor.status == 1).first()
    if not gestor:
        raise HTTPException(404, "Gestor não encontrado")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(gestor, campo, valor)

    db.commit()
    db.refresh(gestor)
    return gestor


def remover(db: Session, id: int):
    gestor = obter(db, id)
    gestor.status = 0 #soft delete
    db.commit()
    return {"detalhe": "Gestor removido"}


#Conta quantos contratos começaram em cada dia dos últimos dias, 
# criando uma lista de datas desde inicio até hoje e devolvendo 
# para cada dia um objeto com "data" e "total"
def adesoes_por_dia(db: Session, dias: int):
    hoje   = date.today()
    inicio = hoje - timedelta(days=dias - 1)

    contratos = db.query(Contrato).filter(Contrato.data_inicio >= inicio,
        Contrato.data_inicio <= hoje,
    ).all()

    contagens: dict[str, int] = {}
    for c in contratos:
        chave = c.data_inicio.isoformat()
        contagens[chave] = contagens.get(chave, 0) + 1

    return [
        {"data": (inicio + timedelta(days=i)).isoformat(), "total": contagens.get((inicio + timedelta(days=i)).isoformat(), 0)}
        for i in range(dias)
    ]
