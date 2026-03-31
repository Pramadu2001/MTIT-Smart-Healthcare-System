from pydantic import BaseModel
from typing import Optional

class AppointmentCreate(BaseModel):
    patient_name: str
    doctor_name: str
    date: str
    time: str
    reason: str
    status: Optional[str] = "Pending"
    
class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
