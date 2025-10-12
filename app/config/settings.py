from dotenv import load_dotenv
import os

# Carga las variables del archivo .env
load_dotenv()

class Settings:
    POSTGRES_URL: str = os.getenv("POSTGRES_URL")
    MONGO_URL: str = os.getenv("MONGO_URL")

settings = Settings()

