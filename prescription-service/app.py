from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

app = FastAPI(title="Prescription Service", description="Healthcare Prescription API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = "mongodb+srv://Pramadu:Pramadu11@cluster0.xndp4ig.mongodb.net/Prescription?retryWrites=true&w=majority"
client = None
db = None

@app.on_event("startup")
def startup_db():
    global client, db
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()

@app.on_event("shutdown")
def shutdown_db():
    if client:
        client.close()

def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@app.get("/")
def index():
    return {"service": "Prescription Service", "status": "UP"}

@app.get("/prescriptions")
def get_prescriptions():
    prescriptions = list(db.prescriptions.find())
    return {"prescriptions": [format_doc(p) for p in prescriptions]}

@app.get("/prescriptions/{id}")
def get_prescription(id: str):
    try:
        prescription = db.prescriptions.find_one({"_id": ObjectId(id)})
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return format_doc(prescription)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

@app.post("/prescriptions", status_code=201)
def add_prescription(data: dict = Body(...)):
    if not data or not data.get("patient_name"):
        raise HTTPException(status_code=400, detail="patient_name is required")
    medicines = data.get("medicines", [])
    if not medicines:
        raise HTTPException(status_code=400, detail="At least one medicine is required")
    result = db.prescriptions.insert_one({
        "patient_name":  data.get("patient_name"),
        "doctor_name":   data.get("doctor_name", ""),
        "medicines":   medicines,
        "notes":       data.get("notes", ""),
        "date_issued": data.get("date_issued", datetime.utcnow().strftime("%Y-%m-%d"))
    })
    return {"message": "Prescription added successfully", "id": str(result.inserted_id)}

@app.put("/prescriptions/{id}")
def update_prescription(id: str, data: dict = Body(...)):
    try:
        db.prescriptions.update_one({"_id": ObjectId(id)}, {"$set": data})
        return {"message": "Prescription updated successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

@app.delete("/prescriptions/{id}")
def delete_prescription(id: str):
    try:
        db.prescriptions.delete_one({"_id": ObjectId(id)})
        return {"message": "Prescription deleted successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8004)
