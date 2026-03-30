from fastapi import APIRouter, HTTPException
from database import patient_collection
from models import PatientModel, UpdatePatientModel
from bson import ObjectId

router = APIRouter(prefix="/patients", tags=["Patients"])

def fix_id(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

# CREATE
@router.post("/", status_code=201)
async def create_patient(patient: PatientModel):
    result = await patient_collection.insert_one(patient.dict())
    new = await patient_collection.find_one({"_id": result.inserted_id})
    return fix_id(new)

# READ ALL
@router.get("/")
async def get_all_patients():
    patients = []
    async for p in patient_collection.find():
        patients.append(fix_id(p))
    return patients

# READ ONE
@router.get("/{id}")
async def get_patient(id: str):
    p = await patient_collection.find_one({"_id": ObjectId(id)})
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return fix_id(p)

# UPDATE
@router.put("/{id}")
async def update_patient(id: str, data: UpdatePatientModel):
    update = {k: v for k, v in data.dict().items() if v is not None}
    result = await patient_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    updated = await patient_collection.find_one({"_id": ObjectId(id)})
    return fix_id(updated)

# DELETE
@router.delete("/{id}")
async def delete_patient(id: str):
    result = await patient_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted successfully"}