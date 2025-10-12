from fastapi import FastAPI
from app.db.postgres import get_postgres_connection
from app.db.mongodb import get_mongo_connection
from app.routers import products_router, orders_router, orders_query_router

app = FastAPI(title="ACME Order Pipeline API")

@app.get("/health")
def health_check():
    pg = get_postgres_connection()
    mg = get_mongo_connection()
    return {
        "status": "healthy",
        "postgres_connected": pg is not None,
        "mongo_connected": mg is not None
    }

app.include_router(products_router.router)
app.include_router(orders_router.router)
app.include_router(orders_query_router.router) 
