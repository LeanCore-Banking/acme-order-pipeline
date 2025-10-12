import psycopg2
from psycopg2.extras import RealDictCursor
from app.config.settings import settings

def get_postgres_connection():
    try:
        conn = psycopg2.connect(settings.POSTGRES_URL, cursor_factory=RealDictCursor)
        print("✅ PostgreSQL conectado correctamente")
        return conn
    except Exception as e:
        print("❌ Error conectando a PostgreSQL:", e)
        return None

