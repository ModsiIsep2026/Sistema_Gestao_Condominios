from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):

    #Base de dados
    DB_HOST: str 
    DB_PORT: int 
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    
    APP_SECRET_KEY: str # Chave secreta para JWT e outras operações de segurança
    APP_ENV: str = "development" 
    APP_DEBUG: bool = True # Para desenvolvimento
    APP_PORT: int = 8000 

    
    @property
    def DB_connect(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


    # Algoritmo de hashing para JWT
    @property
    def ALGORITHM(self) -> str:
        return "HS256"
    

    
    #@property
    #def ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return 60 * 24  


    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
