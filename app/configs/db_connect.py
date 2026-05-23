from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.configs.config import get_configs


settings = get_configs()

db_client = create_engine(settings.DB_connect,pool_pre_ping=True,echo=(settings.APP_ENV == "development" and settings.APP_DEBUG),)

Sessao_Atual = sessionmaker(autocommit=False, autoflush=False, bind=db_client)
  
Base = declarative_base() 


def get_db():
    db = Sessao_Atual()
    
    try:
        yield db # Yield vem do FastAPI, fecha a sessão atual do utilizador após a resposta ser enviada (200)
    finally:
        db.close()
