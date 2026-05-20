from pydantic import BaseModel


class LerEstadoReserva(BaseModel):
    id_estado: int
    nome_pt: str
    nome_en: str

    class Config:
        from_attributes = True


class LerEstadoOrdemTrabalho(BaseModel):
    id_estado: int
    nome_pt: str
    nome_en: str

    class Config:
        from_attributes = True


class LerCategoriaAvaria(BaseModel):
    id_categoria: int
    nome_pt: str
    nome_en: str

    class Config:
        from_attributes = True


class LerCategoriaDespesa(BaseModel):
    id_categoria: int
    nome_pt: str
    nome_en: str

    class Config:
        from_attributes = True