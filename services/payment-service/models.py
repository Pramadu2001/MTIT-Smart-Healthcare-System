from pydantic import BaseModel
from typing import Optional

class PaymentCreate(BaseModel):
    patient_id: str
    amount: float = 0.0
    method: str = "cash"
    status: str = "pending"

class PaymentUpdate(BaseModel):
    patient_id: Optional[str] = None
    amount: Optional[float] = None
    method: Optional[str] = None
    status: Optional[str] = None
