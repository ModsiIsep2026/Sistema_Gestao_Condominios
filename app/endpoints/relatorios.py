from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g
from app.logica import relatorio as servico

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])

# (GET) /relatorios/excel  - Exporta relatório de pagamentos em Excel  (exclusivo do gestor)
# (GET) /relatorios/pdf    - Exporta relatório de pagamentos em PDF    (exclusivo do gestor)

@router.get("/excel")
def download_excel(gestor=Depends(verificar_g),data_inicio: Optional[date] = None,data_fim: Optional[date] = None,db: Session = Depends(get_db),):
    buffer = servico.exportar_excel(db, gestor.id, data_inicio, data_fim)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=relatorio_pagamentos.xlsx"},
    )


@router.get("/pdf")
def download_pdf(gestor=Depends(verificar_g),data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    db: Session = Depends(get_db),
):
    buffer = servico.exportar_pdf(db, gestor.id, data_inicio, data_fim)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=relatorio_pagamentos.pdf"},
    )
