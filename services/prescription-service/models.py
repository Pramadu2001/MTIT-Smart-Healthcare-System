from pydantic import BaseModel, Field
from typing import List, Optional

class PrescriptionCreate(BaseModel):
    patient_name: str
    doctor_name: Optional[str] = ""
    medicines: List[dict]
    notes: Optional[str] = ""
    date_issued: Optional[str] = None

class PrescriptionUpdate(BaseModel):
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    medicines: Optional[List[dict]] = None
    notes: Optional[str] = None
    date_issued: Optional[str] = None
