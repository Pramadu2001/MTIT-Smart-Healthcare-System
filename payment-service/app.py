from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import Optional

app = FastAPI(
    title="Payment Service API",
    description="Healthcare Payment Management API",
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
payments_col = None

@app.on_event("startup")
def startup_db():
    global client, db, payments_col
    uri = "mongodb+srv://MTIT:MTIT123456@cluster1.ddh6mzk.mongodb.net/healthcareDB?retryWrites=true&w=majority"
    client = MongoClient(uri)
    db = client["healthcareDB"]  
    payments_col = db["payments"]

@app.on_event("shutdown")
def shutdown_db():
    if client:
        client.close()

# Pydantic Schemas
class PaymentCreate(BaseModel):
    patient_id: str
    amount: float = 0.0
    method: str = "cash"
    status: str = "pending"

class PaymentUpdate(BaseModel):
    patient_id: Optional[str] = None
    amount: Optional[float] = None
    method: Optional[str] = None
    status: Optional[str] = None

# Helper to format object ID
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

@app.get("/", tags=["Health"])
def home():
    return {"message": "Payment Service Running on Port 8006"}

@app.get("/payments", tags=["Payments"], summary="Get all payments")
def get_payments():
    payments = [serialize(p) for p in payments_col.find()]
    return {"payments": payments}

@app.post("/payments", status_code=201, tags=["Payments"], summary="Create a new payment")
def add_payment(payment: PaymentCreate):
    data = payment.model_dump()
    data["created_at"] = datetime.utcnow()
    result = payments_col.insert_one(data)
    return {
        "message": "Payment created successfully",
        "id": str(result.inserted_id)
    }

@app.get("/payments/patient/{patient_id}", tags=["Payments"], summary="Get payments by patient ID")
def get_payments_by_patient(patient_id: str):
    payments = [serialize(p) for p in payments_col.find({"patient_id": patient_id})]
    return {"payments": payments}

@app.get("/payments/{id}", tags=["Payments"], summary="Get payment by ID")
def get_payment_by_id(id: str):
    oid = parse_object_id(id)
    payment = payments_col.find_one({"_id": oid})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return serialize(payment)

@app.put("/payments/{id}", tags=["Payments"], summary="Update payment")
def update_payment(id: str, payment_update: PaymentUpdate):
    oid = parse_object_id(id)
    update_data = {k: v for k, v in payment_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields provided")

    result = payments_col.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"message": "Payment updated successfully"}

@app.delete("/payments/{id}", tags=["Payments"], summary="Delete payment")
def delete_payment(id: str):
    oid = parse_object_id(id)
    result = payments_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8006)
