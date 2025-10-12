import random
import uuid

def generate_order_id():
    return str(uuid.uuid4())

def simulate_payment():
    """Simula un fallo de pago aleatorio (10% de fallo)"""
    return random.random() >= 0.1
