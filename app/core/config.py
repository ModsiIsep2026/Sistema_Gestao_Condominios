from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):

    # Base de dados
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    APP_SECRET_KEY: str
    APP_ENV: str = "development"
    APP_DEBUG: bool = False
    APP_PORT: int = 8000
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Token expira em 30 minutos por segurança

    GOOGLE_CLIENT_ID: str = "" # Trabalho futuro quando tivermos em prod
    GOOGLE_CLIENT_SECRET: str = "" # --
    GITHUB_CLIENT_ID: str = "" # --
    GITHUB_CLIENT_SECRET: str = "" # --
    MICROSOFT_CLIENT_ID: str = "" # --
    MICROSOFT_CLIENT_SECRET: str = "" # --
    OAUTH_REDIRECT_BASE: str = "http://localhost:8000" # --

    @property
    def DB_connect(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def ALGORITHM(self) -> str:
        return "HS256"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_configs() -> Settings:
    return Settings()



get_settings = get_configs
