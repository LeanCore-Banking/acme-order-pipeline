# apps/infrastructure/persistence/mongo/client.py
from pymongo import MongoClient
from apps.common.config.base import BaseAppSettings

settings = BaseAppSettings()

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = MongoClient(settings.mongo_uri)
    return _client

def orders_col():
    return _get_client()[settings.mongo_db]["orders"]
