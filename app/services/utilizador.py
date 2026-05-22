from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.utilizador import Utilizador
from app.schemas.utilizador import CriarUtilizador, AtualizarUtilizador, CriarUtilizadorPorAdmin
from app.core.seguranca import hash_pw, random_pw
from app.core.config import get_configs
from app.services.email import enviar_email, template_credenciais

PERFIS_NOMES = {1: "Visitante", 2: "Condómino", 3: "Gestor", 4: "Técnico", 5: "Administrador"}


def listar(db: Session, perfil_ids: list[int] | None = None, incluir_inativos: bool = False):
    query = db.query(Utilizador)
    if not incluir_inativos:
        query = query.filter(Utilizador.status == 1)

    if perfil_ids is not None:
        query = query.filter(Utilizador.perfil_id.in_(perfil_ids))
    return query.order_by(Utilizador.status.desc(), Utilizador.nome).all()


def obter(db: Session, id: int):
    utilizador = db.query(Utilizador).filter(Utilizador.id_utilizador == id).first()

    if not utilizador:
        raise HTTPException(404, "Utilizador não encontrado")
    return utilizador


def obter_por_email(db: Session, email: str):
    return db.query(Utilizador).filter(Utilizador.email == email, Utilizador.status == 1).first()


def criar(db: Session, dados: CriarUtilizador):
    if obter_por_email(db, dados.email):

        raise HTTPException(400, "Email já registado")
    
    dados_utilizador = dados.model_dump(exclude={"password"})           # Exceto a password
    dados_utilizador["password_hash"] = hash_pw(dados.password)
    utilizador = Utilizador(**dados_utilizador)
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)
    return utilizador


def atualizar(db: Session, id: int, dados: AtualizarUtilizador):
    utilizador = obter(db, id)
    for k, v in dados.model_dump(exclude_unset=True).items():
        setattr(utilizador, k, v)
    db.commit()
    db.refresh(utilizador)
    return utilizador


def remover(db: Session, id: int):
    utilizador = obter(db, id)
    utilizador.status = 0 # Softdelete , o registo fica sempre no sistema , só não está ativo
    db.commit()
    return {"detalhe": "Utilizador removido"}


async def criar_por_admin(db: Session, dados: CriarUtilizadorPorAdmin):
     # isto aqui ainda tenho que testar
    if obter_por_email(db, dados.email):
        raise HTTPException(400, "Email já registado")

    password_temporaria = random_pw(12)

    utilizador = Utilizador(
        perfil_id=dados.perfil_id,
        nome=dados.nome.strip(),
        email=dados.email,
        password_hash=hash_pw(password_temporaria),
        telemovel=dados.telemovel,
        nif=dados.nif,
        lingua=dados.lingua,
        status=1,
    )
    db.add(utilizador)
    db.commit()
    db.refresh(utilizador)


    configs = get_configs()
    perfil_nome = PERFIS_NOMES.get(dados.perfil_id, "utilizador")
    url_login = f"{configs.APP_URL.rstrip('/')}/website_C/login.html"

    aviso = None
    try:
        texto, html = template_credenciais(
            nome=utilizador.nome,
            email=utilizador.email,
            password=password_temporaria,
            perfil_nome=perfil_nome,
            url_login=url_login,
        )
        await enviar_email(
            destinatario=utilizador.email,
            assunto="Conta criada — Sistema de Gestão de Condomínios",
            corpo_texto=texto,
            corpo_html=html,
        )
    except Exception as e:
        aviso = f"Conta criada mas o email não foi enviado: {e}"

    utilizador.aviso_email = aviso
    utilizador.password_temporaria = password_temporaria if aviso else None
    return utilizador