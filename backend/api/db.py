import psycopg2
from pymongo import MongoClient

def get_pg_connection():
    conn = psycopg2.connect(
        host="postgres",
        database="ecommerce_inventory",
        user="postgres",
        password="postgres123"
    )
    return conn


def get_mongo_connection():
    client = MongoClient("mongodb://admin:admin123@mongodb:27017/")
    return client["ecommerce_orders"]

