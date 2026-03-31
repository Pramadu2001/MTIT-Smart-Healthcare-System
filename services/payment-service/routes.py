from fastapi import APIRouter, HTTPException
from database import payments_collection
from models import PaymentCreate, PaymentUpdate
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime

router = APIRouter(prefix="/payments", tags=["Payments"])

def serialize(doc):
    if not doc: return None
    doc["id"] = str(doc.get("_id"))
    doc.pop("_id", None)
    if "created_at" in doc and hasattr(doc["created_at"], "isoformat"):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc

def parse_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid payment ID")

@router.get("", summary="Get all payments")
async def get_payments():
    payments = []
    async for p in payments_collection.find():
        payments.append(serialize(p))
    return {"payments": payments}

@router.post("", status_code=201, summary="Create a new payment")
async def add_payment(payment: PaymentCreate):
    data = payment.model_dump()
    data["created_at"] = datetime.utcnow()
    result = await payments_collection.insert_one(data)
    return {
        "message": "Payment created successfully",
        "id": str(result.inserted_id)
    }

@router.get("/patient/{patient_id}", summary="Get payments by patient ID")
async def get_payments_by_patient(patient_id: str):
    payments = []
    async for p in payments_collection.find({"patient_id": patient_id}):
        payments.append(serialize(p))
    return {"payments": payments}

@router.get("/{id}", summary="Get payment by ID")
async def get_payment_by_id(id: str):
    oid = parse_object_id(id)
    payment = await payments_collection.find_one({"_id": oid})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return serialize(payment)

@router.put("/{id}", summary="Update payment")
async def update_payment(id: str, payment_update: PaymentUpdate):
    oid = parse_object_id(id)
    update_data = {k: v for k, v in payment_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields provided")

    result = await payments_collection.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"message": "Payment updated successfully"}

@router.delete("/{id}", summary="Delete payment")
async def delete_payment(id: str):
    oid = parse_object_id(id)
    result = await payments_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment deleted successfully"}
