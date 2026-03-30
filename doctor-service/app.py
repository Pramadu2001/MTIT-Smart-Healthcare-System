from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI(
    title="Doctor Service",
    description="Healthcare Doctor Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ MongoDB Connection
client = MongoClient("mongodb+srv://NethmiSathsarani:sarani123@cluster0.o4zywzb.mongodb.net/?appName=Cluster0")

# ✅ Check connection
try:
    client.admin.command("ping")
    print("✅ MongoDB Connected Successfully")
except Exception as e:
    print("❌ MongoDB Connection Failed:", e)

db = client["healthcare"]
doctors_col = db["doctors"]


# ✅ Pydantic Schemas
class DoctorCreate(BaseModel):
    name: str
    specialization: str
    contact: str
    email: EmailStr
    experience: int
    availability: str


class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[EmailStr] = None
    experience: Optional[int] = None
    availability: Optional[str] = None


# ✅ Safe format
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


# ✅ GET ALL doctors
@app.get("/doctors", tags=["Doctors"])
def get_all_doctors():
    doctors = [format_doctor(d) for d in doctors_col.find()]
    return {"success": True, "data": doctors}


# ✅ CREATE doctor
@app.post("/doctors", status_code=201, tags=["Doctors"])
def create_doctor(doctor: DoctorCreate):
    data = doctor.model_dump()

    if doctors_col.find_one({"email": data["email"]}):
        raise HTTPException(status_code=400, detail="Email already exists")

    result = doctors_col.insert_one(data)
    data["_id"] = result.inserted_id
    return {"success": True, "data": format_doctor(data)}


# ✅ GET ONE doctor
@app.get("/doctors/{doctor_id}", tags=["Doctors"])
def get_doctor(doctor_id: str):
    oid = parse_object_id(doctor_id)
    d = doctors_col.find_one({"_id": oid})
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"success": True, "data": format_doctor(d)}


# ✅ UPDATE doctor
@app.put("/doctors/{doctor_id}", tags=["Doctors"])
def update_doctor(doctor_id: str, doctor: DoctorUpdate):
    oid = parse_object_id(doctor_id)
    update_data = {k: v for k, v in doctor.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = doctors_col.update_one({"_id": oid}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")

    updated = doctors_col.find_one({"_id": oid})
    return {"success": True, "data": format_doctor(updated)}


# ✅ DELETE doctor
@app.delete("/doctors/{doctor_id}", tags=["Doctors"])
def delete_doctor(doctor_id: str):
    oid = parse_object_id(doctor_id)
    result = doctors_col.delete_one({"_id": oid})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return {"success": True}


# ✅ SEARCH by specialization
@app.get("/doctors/search/{specialization}", tags=["Doctors"])
def search_doctors(specialization: str):
    doctors = [
        format_doctor(d)
        for d in doctors_col.find(
            {"specialization": {"$regex": specialization, "$options": "i"}}
        )
    ]
    return {"success": True, "data": doctors}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8002, reload=True)
