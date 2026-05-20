from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import get_settings


settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.APP_DEBUG
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)  

Base = declarative_base() # Isto é o modelo base para as classes usadas nos endpoints


def get_db():
    db = SessionLocal()
    try:
        yield db # Yield vem do FastAPI, fecha a sessão atual do utilizador após a resposta ser enviada (200)
    finally:
        db.close()
