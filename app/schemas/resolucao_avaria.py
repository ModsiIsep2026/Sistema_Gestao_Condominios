from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ResolucaoAvaria(BaseModel):
    id_registo_avaria: int
    id_tecnico: int


class CriarResolucaoAvaria(ResolucaoAvaria):
    pass


class AtualizarResolucaoAvaria(BaseModel):
    id_tecnico: Optional[int] = None
    status: Optional[int] = None                            # 0=pendente 1=resolvido
    data_resolucao: Optional[datetime] = None


class LerResolucaoAvaria(ResolucaoAvaria):
    id: int
    status: int  
    data_resolucao: Optional[datetime] = None

    class Config:
        from_attributes = True
