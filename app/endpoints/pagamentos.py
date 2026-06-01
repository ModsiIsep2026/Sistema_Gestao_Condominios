from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, verificar_c
from app.tabelas_bd.edificio import Edificio
from app.tabelas_bd.apartamento import Apartamento
from app.tabelas_bd.pagamento import Pagamento
from app.estruturas.pagamento import CriarPagamento, LerPagamento
from app.logica import acesso_gestor
from app.logica import pagamento as servico

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

# (GET)  /pagamentos - Lista os pagamentos de um apartamento (acesso exclusivo do gestor).
# (GET)  /pagamentos/gestor - Lista todos os pagamentos associados aos edifícios do gestor autenticado.
# (GET)  /pagamentos/condomino - Lista os pagamentos do condómino autenticado.
# (POST) /pagamentos - Cria novos pagamentos (quotas mensais) para os apartamentos (exclusivo do gestor).
# (POST) /pagamentos/{id}/pagar - Regista o pagamento de uma quota por parte do condómino.
# (POST) /pagamentos/{id}/marcar-pago - Marca um pagamento como feito (acesso exclusivo do gestor)

@router.get("", response_model=List[LerPagamento])
def listar(id_apartamento: int, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_apartamento(db, id_apartamento, gestor.id)
    return servico.listar(db, id_apartamento)

@router.get("/gestor", response_model=List[LerPagamento])
def listar_gestor(gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    return (db.query(Pagamento).join(Apartamento, Pagamento.id_apartamento == Apartamento.id)
        .join(Edificio, Apartamento.id_edificio == Edificio.id)
        .filter(
            Edificio.id_gestor == gestor.id,
            Edificio.status == 1,
            Apartamento.status == 1,
            Pagamento.status == 1,
        )
        .all()
    )


@router.get("/condominio", response_model=List[LerPagamento])
def listar_meus(condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar(db, condomino.id_apartamento)

@router.post("", response_model=LerPagamento, status_code=201)
def criar(dados: CriarPagamento, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_apartamento(db, dados.id_apartamento, gestor.id)
    return servico.criar(db, dados)

@router.post("/{id}/pagar", response_model=LerPagamento)
def pagar(id: int, condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    pagamento = db.query(Pagamento).filter(
        Pagamento.id == id,
        Pagamento.id_apartamento == condomino.id_apartamento,
        Pagamento.status == 1,
    ).first()
    if not pagamento:
        raise HTTPException(403, "Sem permissão para pagar esta quota.")
    return servico.pagamento_feito(db, id)

@router.post("/{id}/marcar-pago", response_model=LerPagamento)
def marcar_pago(id: int, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_pagamento(db, id, gestor.id)
    return servico.pagamento_feito(db, id)
