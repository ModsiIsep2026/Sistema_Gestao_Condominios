from fastapi import APIRouter, HTTPException
from app.estruturas.contacto import MensagemContacto
from app.logica import contacto as servico

router = APIRouter(prefix="/contacto", tags=["Contacto"])


@router.post("", status_code=204)
def enviar_contacto(dados: MensagemContacto):

    try:
        servico.enviar_contacto(dados)
    except Exception as exc:
        raise HTTPException(500, f"Não foi possível enviar o email: {exc}")
