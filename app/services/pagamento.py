from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.pagamento import Pagamento
from app.models.apartamento import Apartamento


def listar(db: Session, id_apartamento: int):
    return db.query(Pagamento).filter(Pagamento.id_apartamento == id_apartamento, Pagamento.status == 1).all()


def criar(db: Session, dados):
    apt = db.query(Apartamento).filter(Apartamento.id == dados.id_apartamento, Apartamento.status == 1).first()

    if not apt:
        raise HTTPException(404, "Apartamento não encontrado")

    verificar = db.query(Pagamento).filter(
        Pagamento.id_apartamento == dados.id_apartamento,
        Pagamento.mes == dados.mes,
        Pagamento.status == 1,
    ).first()
    if verificar:
        raise HTTPException(400, f"Já realizou o pagamento para o mês {dados.mes}")

    pagamento = Pagamento(
        id_apartamento=dados.id_apartamento,
        mes=dados.mes,
        valor=apt.calcular_quota_mensal(),
        data_i=datetime.utcnow(),
        status=1,
        estado=0,
    )
    db.add(pagamento)
    db.commit()
    db.refresh(pagamento)
    return pagamento


def pagamento_feito(db: Session, id: int):
    pagamento = db.query(Pagamento).filter(Pagamento.id == id, Pagamento.status == 1).first()

    if not pagamento:
        raise HTTPException(404, "Pagamento não registado")
    
    pagamento.estado = 1
    pagamento.data_p = datetime.utcnow()
    db.commit()
    db.refresh(pagamento)
    return pagamento
