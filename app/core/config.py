from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    #BD

    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # Aplicação
    APP_SECRET_KEY: str
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000

    
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


    # Json Web Token (JWT) para autenticação ( trabalho futuro)
    @property
    def ALGORITHM(self) -> str:
        return "HS256"
    # futuros
    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return 60 * 24  

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
