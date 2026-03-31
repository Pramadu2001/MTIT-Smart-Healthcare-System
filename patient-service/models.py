from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class PatientModel(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    address: str
    blood_type: str

class UpdatePatientModel(BaseModel):
    name: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    contact: Optional[str]
    address: Optional[str]
    blood_type: Optional[str]