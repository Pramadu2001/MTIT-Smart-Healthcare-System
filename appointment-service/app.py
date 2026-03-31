from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from typing import Optional

app = FastAPI(
    title="Appointment Service",
    description="Healthcare Appointment Management API",
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
appointments_col = None

@app.on_event("startup")
def startup_db():
    global client, db, appointments_col
    uri = "mongodb+srv://healthadmin:healthadmin@healthcare-microservice.5rmmjnt.mongodb.net/healthcare_db?retryWrites=true&w=majority&tls=true"
    client = MongoClient(uri)
    db = client["healthcare_db"]
    appointments_col = db["appointments"]

@app.on_event("shutdown")
def shutdown_db():
    if client:
        client.close()

# Helper to format object ID
def serialize(doc):
    if not doc: return None
    doc["id"] = str(doc.get("_id"))
    doc.pop("_id", None) # Clean up the old MongoDB id reference for the frontend
    return doc

def parse_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

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

@app.get("/appointments", tags=["Appointments"], summary="Get all appointments")
def get_appointments():
    appointments = [serialize(a) for a in appointments_col.find()]
    return {"success": True, "data": appointments}

@app.post("/appointments", status_code=201, tags=["Appointments"], summary="Book a new appointment")
def book_appointment(appointment: AppointmentCreate):
    data = appointment.model_dump()
    result = appointments_col.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return {"success": True, "message": "Appointment booked successfully", "data": data}

@app.get("/appointments/{appointment_id}", tags=["Appointments"], summary="Get a single appointment by ID")
def get_appointment(appointment_id: str):
    oid = parse_object_id(appointment_id)
    appt = appointments_col.find_one({"_id": oid})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "data": serialize(appt)}

@app.put("/appointments/{appointment_id}", tags=["Appointments"], summary="Update an appointment")
def update_appointment(appointment_id: str, appointment_update: AppointmentUpdate):
    oid = parse_object_id(appointment_id)
    update_data = {k: v for k, v in appointment_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = appointments_col.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"success": True, "message": "Appointment updated successfully"}

@app.delete("/appointments/{appointment_id}", tags=["Appointments"], summary="Delete an appointment")
def delete_appointment(appointment_id: str):
    oid = parse_object_id(appointment_id)
    result = appointments_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "message": "Appointment deleted successfully"}

@app.get("/", tags=["Health"])
def health_check():
    return {"service": "Appointment Service", "status": "UP"}

if __name__ == "__main__":
    import uvicorn
    # Excluding reload=True on windows to completely avoid ghost-process port blocking
    uvicorn.run("app:app", host="0.0.0.0", port=8003)
