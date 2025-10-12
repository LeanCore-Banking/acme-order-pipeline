from pymongo import MongoClient
from app.config.settings import settings

def get_mongo_connection():
    try:
        client = MongoClient(settings.MONGO_URL)
        db = client["ecommerce_orders"]
        print("✅ MongoDB conectado correctamente")
        return db
    except Exception as e:
        print("❌ Error conectando a MongoDB:", e)
        return None

