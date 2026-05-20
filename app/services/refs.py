from sqlalchemy.orm import Session
from app.models.perfil import Perfil
from app.models.estado_reserva import EstadoReserva
from app.models.estado_ordem_trabalho import EstadoOrdemTrabalho
from app.models.categoria_avaria import CategoriaAvaria
from app.models.categoria_despesa import CategoriaDespesa

 # Este ficheiro contém algumas funções de referência para serem usadas para serem usadas nos services
def listar_perfis(db: Session):
    return db.query(Perfil).filter(Perfil.status == 1).all() # Perfis ativos

# Querys para obter todas as informações 

def listar_estados_reserva(db: Session):
    return db.query(EstadoReserva).all()  # 


def listar_estados_ordem_trabalho(db: Session):
    return db.query(EstadoOrdemTrabalho).all()


def listar_categorias_avaria(db: Session):
    return db.query(CategoriaAvaria).all()


def listar_categorias_despesa(db: Session):
    return db.query(CategoriaDespesa).all()