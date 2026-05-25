from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RegistoAvaria(BaseModel):
    zona: str
    descricao: Optional[str] = None
    id_edificio: int


class CriarRegistoAvaria(RegistoAvaria):
    pass


class AtualizarRegistoAvaria(BaseModel):
    zona: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[int] = None


class LerTecnicoResumo(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True


class LerResolucaoInfo(BaseModel):
    id: int
    id_tecnico: Optional[int] = None
    status: int                              # 0=pendente  1=resolvida
    data_resolucao: Optional[datetime] = None
    tecnico: Optional[LerTecnicoResumo] = None

    class Config:
        from_attributes = True


class LerAptAvaria(BaseModel):
    fracao: str
    andar: Optional[int] = None

    class Config:
        from_attributes = True


class LerCondominoAvaria(BaseModel):
    id: int
    nome: str
    apartamento: Optional[LerAptAvaria] = None

    class Config:
        from_attributes = True


class LerEdificioAvaria(BaseModel):
    id: int
    rua: str

    class Config:
        from_attributes = True


class LerRegistoAvaria(RegistoAvaria):
    id: int
    id_condomino: int
    data_registo: datetime
    status: int
    resolucao: Optional[LerResolucaoInfo] = None
    condomino: Optional[LerCondominoAvaria] = None
    edificio: Optional[LerEdificioAvaria] = None

    class Config:
        from_attributes = True
