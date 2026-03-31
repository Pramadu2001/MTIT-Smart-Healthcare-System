from fastapi import APIRouter, HTTPException
from database import doctors_collection
from models import DoctorCreate, DoctorUpdate
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter(prefix="/doctors", tags=["Doctors"])

def format_doctor(d: dict) -> dict:
    return {
        "id": str(d.get("_id")),
        "name": d.get("name", ""),
        "specialization": d.get("specialization", ""),
        "contact": d.get("contact", ""),
        "email": d.get("email", ""),
        "experience": d.get("experience", 0),
        "availability": d.get("availability", ""),
    }

def parse_object_id(doctor_id: str) -> ObjectId:
    try:
        return ObjectId(doctor_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID")

@router.get("")
async def get_all_doctors():
    doctors = []
    async for d in doctors_collection.find():
        doctors.append(format_doctor(d))
    return {"success": True, "data": doctors}

@router.post("", status_code=201)
async def create_doctor(doctor: DoctorCreate):
    data = doctor.model_dump()
    if await doctors_collection.find_one({"email": data["email"]}):
        raise HTTPException(status_code=400, detail="Email already exists")
    result = await doctors_collection.insert_one(data)
    new = await doctors_collection.find_one({"_id": result.inserted_id})
    return {"success": True, "data": format_doctor(new)}

@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str):
    oid = parse_object_id(doctor_id)
    d = await doctors_collection.find_one({"_id": oid})
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"success": True, "data": format_doctor(d)}

@router.put("/{doctor_id}")
async def update_doctor(doctor_id: str, doctor: DoctorUpdate):
    oid = parse_object_id(doctor_id)
    update_data = {k: v for k, v in doctor.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await doctors_collection.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    updated = await doctors_collection.find_one({"_id": oid})
    return {"success": True, "data": format_doctor(updated)}

@router.delete("/{doctor_id}")
async def delete_doctor(doctor_id: str):
    oid = parse_object_id(doctor_id)
    result = await doctors_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"success": True}

@router.get("/search/{specialization}")
async def search_doctors(specialization: str):
    doctors = []
    async for d in doctors_collection.find({"specialization": {"$regex": specialization, "$options": "i"}}):
        doctors.append(format_doctor(d))
    return {"success": True, "data": doctors}
