from pydantic import BaseModel, EmailStr
from typing import Optional

class DoctorCreate(BaseModel):
    name: str
    specialization: str
    contact: str
    email: EmailStr
    experience: int
    availability: str

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[EmailStr] = None
    experience: Optional[int] = None
    availability: Optional[str] = None
