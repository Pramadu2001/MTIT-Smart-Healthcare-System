from fastapi import APIRouter, HTTPException, Body
from database import prescriptions_collection
from models import PrescriptionCreate, PrescriptionUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("")
async def get_prescriptions():
    prescriptions = []
    async for p in prescriptions_collection.find():
        prescriptions.append(format_doc(p))
    return {"prescriptions": prescriptions}

@router.get("/{id}")
async def get_prescription(id: str):
    try:
        prescription = await prescriptions_collection.find_one({"_id": ObjectId(id)})
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return format_doc(prescription)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

@router.post("", status_code=201)
async def add_prescription(data: PrescriptionCreate):
    prescription_data = data.model_dump()
    if not prescription_data.get("medicines"):
        raise HTTPException(status_code=400, detail="At least one medicine is required")
    
    if not prescription_data.get("date_issued"):
        prescription_data["date_issued"] = datetime.utcnow().strftime("%Y-%m-%d")

    result = await prescriptions_collection.insert_one(prescription_data)
    return {"message": "Prescription added successfully", "id": str(result.inserted_id)}

@router.put("/{id}")
async def update_prescription(id: str, data: PrescriptionUpdate):
    try:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_data:
            await prescriptions_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        return {"message": "Prescription updated successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

@router.delete("/{id}")
async def delete_prescription(id: str):
    try:
        await prescriptions_collection.delete_one({"_id": ObjectId(id)})
        return {"message": "Prescription deleted successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
