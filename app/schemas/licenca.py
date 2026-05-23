from pydantic import BaseModel
from typing import Optional


class LerLicenca(BaseModel):
    id: int
    num_edificios: int
    ppem: float
    status: int

    class Config:
        from_attributes = True
