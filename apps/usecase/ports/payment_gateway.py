from decimal import Decimal

class PaymentGateway:
    def charge(self, amount: Decimal) -> bool:
        raise NotImplementedError
