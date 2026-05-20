from sqlalchemy import create_engine # Ligação da db
from sqlalchemy.orm import declarative_base, sessionmaker #
from app.core.config import get_settings 


settings = get_settings()

db_client = create_engine(settings.DB_connect,pool_pre_ping=True,echo=settings.APP_DEBUG)
Sessao_Atual = sessionmaker(autocommit=False, autoflush=False, bind=db_client)  
Base = declarative_base() # Através desta classe é que vamos criar as nossas tabelas, é a base da nossa db


def get_db():
    db = Sessao_Atual()
    
    try:
        yield db # Yield vem do FastAPI, fecha a sessão atual do utilizador após a resposta ser enviada (200)
    finally:
        db.close()
