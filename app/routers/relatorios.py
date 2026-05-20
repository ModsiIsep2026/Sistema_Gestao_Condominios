from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.db_connect import get_db
from app.services import relatorios as servico

router = APIRouter(prefix="/relatorios", tags=["Relatorios"])

# (GET) /relatorios/excel - Exporta relatório de despesas em formato Excel 
# (GET) /relatorios/pdf   - Exporta relatório de despesas em formato PDF 


@router.get("/excel")
def download_excel(gestor_id: int,data_inicio: Optional[date] = None,data_fim: Optional[date] = None,db: Session = Depends(get_db),):

    dados= servico.exportar_excel(db, gestor_id, data_inicio, data_fim)
    return StreamingResponse(
        dados,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=relatorio_despesas.xlsx"},
    )


@router.get("/pdf")
def download_pdf(gestor_id: int,data_inicio: Optional[date] = None,data_fim: Optional[date] = None,db: Session = Depends(get_db),):
    
    dados = servico.exportar_pdf(db, gestor_id, data_inicio, data_fim)
    return StreamingResponse(
        dados,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=relatorio_despesas.pdf"},
    )
