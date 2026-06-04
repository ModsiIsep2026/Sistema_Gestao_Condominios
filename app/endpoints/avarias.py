from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.configs.db_connect import get_db
from app.configs.seguranca import verificar_g, verificar_c, verificar_t, token_atual, verificar_a
from app.tabelas_bd.resolucao_avaria import ResolucaoAvaria
from app.estruturas.registo_avaria import CriarRegistoAvaria, AtualizarRegistoAvaria, LerRegistoAvaria
from app.estruturas.resolucao_avaria import CriarResolucaoAvaria, AtualizarResolucaoAvaria, LerResolucaoAvaria
from app.logica import acesso_gestor
from app.logica import avaria as servico

router = APIRouter(prefix="/avarias", tags=["Avarias"])

# (GET)  /avarias - Lista as avarias de um edifício.
# (GET)  /avarias/tecnico - Lista as avarias atribuídas ao técnico autenticado.
# (GET)  /avarias/condomino - Lista as avarias reportadas pelo condómino autenticado.
# (GET)  /avarias/{id} - Exibe os detalhes de uma avaria específica.
# (POST) /avarias - Cria um novo registo de avaria.
# (PUT)  /avarias/{id} - Atualiza uma avaria.
# (POST) /avarias/{id}/resolucao - Atribui um técnico para resolver a avaria.
# (PUT)  /avarias/{id}/resolucao - Atualiza o estado da resolução da avaria.

@router.get("", response_model=List[LerRegistoAvaria])
def listar(id_edificio: int, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_edificio(db, id_edificio, gestor.id)
    return servico.listar_pedificio(db, id_edificio)

@router.get("/tecnico", response_model=List[LerRegistoAvaria])
def listar_tecnico(tecnico=Depends(verificar_t), db: Session = Depends(get_db)):
    return servico.listar_ptecnico(db, tecnico.id)

@router.get("/condomino", response_model=List[LerRegistoAvaria])
def listar_minhas(condomino=Depends(verificar_c), db: Session = Depends(get_db)):
    return servico.listar_pcondomino(db, condomino.id)

@router.get("/{id}", response_model=LerRegistoAvaria)
def obter(id: int, token: dict = Depends(token_atual), db: Session = Depends(get_db)):
    avaria = servico.obter(db, id)
    tipo = token["tipo"]
    uid  = token["id"]

    if tipo == "admin":
        return avaria

    if tipo == "gestor":
        acesso_gestor.obter_edificio(db, avaria.id_edificio, uid)
        return avaria

    if tipo == "condomino":
        from app.tabelas_bd.condomino import Condomino
        cond = db.query(Condomino).filter(Condomino.id == uid, Condomino.status == 1).first()
        if not cond or not cond.apartamento or cond.apartamento.id_edificio != avaria.id_edificio:
            raise HTTPException(403, "Sem permissão para aceder a esta avaria.")
        return avaria

    if tipo == "tecnico":
        atribuido = db.query(ResolucaoAvaria).filter(
            ResolucaoAvaria.id_registo_avaria == id,
            ResolucaoAvaria.id_tecnico == uid,
        ).first()
        if not atribuido:
            raise HTTPException(403, "Sem permissão para aceder a esta avaria.")
        return avaria

    raise HTTPException(403, "Sem permissão.")

@router.post("", response_model=LerRegistoAvaria, status_code=201)
def criar(dados: CriarRegistoAvaria, condomino=Depends(verificar_c), db: Session = Depends(get_db)):

    id_edificio_condomino = condomino.apartamento.id_edificio if condomino.apartamento else None
    
    if id_edificio_condomino is None or dados.id_edificio != id_edificio_condomino:

        raise HTTPException(403, "A avaria tem de ser reportada no seu edifício.") # isto é dificil acontecer mas coloquei mensagem de erro na mesma
    
    return servico.criar(db, dados, condomino.id)


@router.put("/{id}", response_model=LerRegistoAvaria)
def atualizar(id: int, dados: AtualizarRegistoAvaria, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_avaria(db, id, gestor.id)
    return servico.atualizar(db, id, dados)

@router.post("/{id}/resolucao", response_model=LerResolucaoAvaria, status_code=201)
def criar_resolucao(id: int, dados: CriarResolucaoAvaria, gestor=Depends(verificar_g), db: Session = Depends(get_db)):
    acesso_gestor.obter_avaria(db, id, gestor.id)
    return servico.criar_resolucao(db, id, dados.id_tecnico)

@router.put("/{id}/resolucao", response_model=LerResolucaoAvaria)
def atualizar_resolucao(id: int, dados: AtualizarResolucaoAvaria, token: dict = Depends(token_atual), db: Session = Depends(get_db)):
    tipo = token["tipo"]
    uid  = token["id"]

    if tipo == "gestor":
        acesso_gestor.obter_avaria(db, id, uid)
    elif tipo == "tecnico":
        atribuido = db.query(ResolucaoAvaria).filter(
            ResolucaoAvaria.id_registo_avaria == id,
            ResolucaoAvaria.id_tecnico == uid,
        ).first()
        if not atribuido:
            raise HTTPException(403, "Sem permissão para atualizar esta resolução.")
    else:
        raise HTTPException(403, "Sem permissão.")

    return servico.atualizar_resolucao(db, id, dados)
