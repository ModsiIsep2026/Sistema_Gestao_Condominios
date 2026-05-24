from datetime import date, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tabelas_bd.gestor import Gestor
from app.tabelas_bd.contrato import Contrato
from app.configs.seguranca import pw_encript


def listar(db: Session):
    return db.query(Gestor).filter(Gestor.status == 1).all()


def listar_todos(db: Session):
    from app.logica.contrato import verificar_expirados
    verificar_expirados(db)

    gestores = db.query(Gestor).all()
    resultado = []
    for g in gestores:
        resultado.append({
            "id":        g.id,
            "nome":      g.nome,
            "empresa":   g.empresa,
            "telemovel": g.telemovel,
            "email":     g.email,
            "status":    g.status,
            "data_fim":  g.contrato.data_fim if g.contrato else None,
        })
    return resultado


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
    gestor = obter(db, id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(gestor, campo, valor)
    
    db.commit()
    db.refresh(gestor)
    return gestor


def remover(db: Session, id: int):
    gestor = obter(db, id)
    gestor.status = 0
    db.commit()
    return {"detalhe": "Gestor removido"}


def adesoes_por_dia(db: Session, dias: int):
    """Conta contratos criados por dia nos últimos N dias (proxy de adesão de gestor)."""
    hoje   = date.today()
    inicio = hoje - timedelta(days=dias - 1)

    # Buscar todos os contratos com data_inicio no intervalo
    contratos = db.query(Contrato).filter(
        Contrato.data_inicio >= inicio,
        Contrato.data_inicio <= hoje,
    ).all()

    # Construir mapa data → contagem
    contagens: dict[str, int] = {}
    for c in contratos:
        chave = c.data_inicio.isoformat()
        contagens[chave] = contagens.get(chave, 0) + 1

    # Preencher todos os dias do intervalo (0 se não houve adesões)
    resultado = []
    for i in range(dias):
        d = (inicio + timedelta(days=i)).isoformat()
        resultado.append({"data": d, "total": contagens.get(d, 0)})

    return resultado
