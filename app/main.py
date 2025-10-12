from fastapi import FastAPI
from app.db.postgres import get_postgres_connection
from app.db.mongodb import get_mongo_connection

app = FastAPI(title="ACME Order Pipeline API")

@app.get("/health")
def health_check():
    """Endpoint de salud para verificar el sistema"""
    pg = get_postgres_connection()
    mg = get_mongo_connection()
    return {
        "status": "healthy",
        "postgres_connected": pg is not None,
        "mongo_connected": mg is not None
    }

