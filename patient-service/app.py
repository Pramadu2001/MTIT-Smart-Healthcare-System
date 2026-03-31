from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from typing import Optional

app = FastAPI(
    title="Patient Service",
    description="Healthcare Patient Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = None
db = None
patients_col = None

@app.on_event("startup")
def startup_db():
    global client, db, patients_col
    uri = "mongodb+srv://healthadmin:healthadmin@healthcare-microservice.5rmmjnt.mongodb.net/healthcare_db?retryWrites=true&w=majority&tls=true"
    client = MongoClient(uri)
    db = client["healthcare_db"]
    patients_col = db["patients"]

@app.on_event("shutdown")
def shutdown_db():
    if client:
        client.close()

# Helper to format object ID
def serialize(doc):
    if not doc: return None
    doc["_id"] = str(doc.get("_id"))
    return doc

def parse_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = 0
    gender: Optional[str] = ""
    contact: Optional[str] = ""
    address: Optional[str] = ""
    blood_type: Optional[str] = ""

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    blood_type: Optional[str] = None

@app.get("/patients", tags=["Patients"], summary="Get all patients")
def get_patients():
    patients = [serialize(p) for p in patients_col.find()]
    return {"success": True, "data": patients}

@app.post("/patients", status_code=201, tags=["Patients"], summary="Register a new patient")
def add_patient(patient: PatientCreate):
    data = patient.model_dump()
    result = patients_col.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return {"success": True, "message": "Patient added successfully", "data": data}

@app.put("/patients/{patient_id}", tags=["Patients"], summary="Update an existing patient")
def update_patient(patient_id: str, patient_update: PatientUpdate):
    oid = parse_object_id(patient_id)
    update_data = {k: v for k, v in patient_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = patients_col.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {"success": True, "message": "Patient updated successfully"}

@app.delete("/patients/{patient_id}", tags=["Patients"], summary="Delete a patient")
def delete_patient(patient_id: str):
    oid = parse_object_id(patient_id)
    result = patients_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True, "message": "Patient deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    # Excluding reload=True on windows to completely avoid ghost-process port blocking
    uvicorn.run("app:app", host="0.0.0.0", port=8001)
