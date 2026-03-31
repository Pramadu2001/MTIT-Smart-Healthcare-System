from fastapi import APIRouter, HTTPException
from database import appointments_collection
from models import AppointmentCreate, AppointmentUpdate
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter(prefix="/appointments", tags=["Appointments"])

def serialize(doc):
    if not doc: return None
    doc["id"] = str(doc.get("_id"))
    doc.pop("_id", None)
    return doc

def parse_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

@router.get("", summary="Get all appointments")
async def get_appointments():
    appointments = []
    async for a in appointments_collection.find():
        appointments.append(serialize(a))
    return {"success": True, "data": appointments}

@router.post("", status_code=201, summary="Book a new appointment")
async def book_appointment(appointment: AppointmentCreate):
    data = appointment.model_dump()
    result = await appointments_collection.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return {"success": True, "message": "Appointment booked successfully", "data": data}

@router.get("/{appointment_id}", summary="Get a single appointment by ID")
async def get_appointment(appointment_id: str):
    oid = parse_object_id(appointment_id)
    appt = await appointments_collection.find_one({"_id": oid})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "data": serialize(appt)}

@router.put("/{appointment_id}", summary="Update an appointment")
async def update_appointment(appointment_id: str, appointment_update: AppointmentUpdate):
    oid = parse_object_id(appointment_id)
    update_data = {k: v for k, v in appointment_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = await appointments_collection.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"success": True, "message": "Appointment updated successfully"}

@router.delete("/{appointment_id}", summary="Delete an appointment")
async def delete_appointment(appointment_id: str):
    oid = parse_object_id(appointment_id)
    result = await appointments_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "message": "Appointment deleted successfully"}
