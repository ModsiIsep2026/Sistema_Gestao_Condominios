from sqlalchemy.orm import Session
from app.models.pagamento import Pagamento
from app.schemas.pagamento import CriarPagamento


def listar(db: Session):
    return db.query(Pagamento).filter(Pagamento.status == 1).all() # Pagamentos com status 1 são os ativos, ou seja, os que não foram eliminados (soft delete)


def criar(db: Session, dados: CriarPagamento):
    pagamento = Pagamento(**dados.model_dump())
    db.add(pagamento)
    db.commit()
    db.refresh(pagamento)
    return pagamento