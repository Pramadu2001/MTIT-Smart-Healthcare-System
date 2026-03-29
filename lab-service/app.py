from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient
from bson import ObjectId
import config

app = FastAPI(
    title="Lab Service",
    description="Healthcare Lab Test Results API",
    version="1.0.0"
)

# MongoDB connection
client = MongoClient(config.MONGO_URI)
db = client["lab_service_db"]
collection = db["lab_results"]


# Helper to convert MongoDB _id to string
def format_result(result):
    result["_id"] = str(result["_id"])
    return result


# Request body model
class LabResult(BaseModel):
    patient_id: str
    test_name: str
    result_value: str
    status: Optional[str] = "Pending"
    date: Optional[str] = ""

    model_config = {
        "json_schema_extra": {
            "example": {
                "patient_id": "P001",
                "test_name": "Blood Sugar",
                "result_value": "110 mg/dL",
                "status": "Normal",
                "date": "2026-03-29"
            }
        }
    }


# POST - Add a new lab result
@app.post("/lab-results", status_code=201, summary="Add a new lab test result")
def add_lab_result(result: LabResult):
    new_result = result.model_dump()
    inserted = collection.insert_one(new_result)
    new_result["_id"] = str(inserted.inserted_id)
    return {"message": "Lab result added successfully", "data": new_result}


# GET - Get all lab results
@app.get("/lab-results", summary="Get all lab test results")
def get_all_results():
    results = list(collection.find())
    return {"results": [format_result(r) for r in results]}


# GET - Get results by patient ID
@app.get("/lab-results/{patient_id}", summary="Get lab results by patient ID")
def get_results_by_patient(patient_id: str):
    results = list(collection.find({"patient_id": patient_id}))
    if not results:
        raise HTTPException(status_code=404, detail="No results found for this patient")
    return [format_result(r) for r in results]


# DELETE - Delete a lab result
@app.delete("/lab-results/{result_id}", summary="Delete a lab result by ID")
def delete_result(result_id: str):
    try:
        deleted = collection.delete_one({"_id": ObjectId(result_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid result ID format")
    if deleted.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return {"message": "Lab result deleted successfully"}

    # PUT - Update a lab result
@app.put("/lab-results/{result_id}", summary="Update a lab result by ID")
def update_result(result_id: str, result: LabResult):
    try:
        updated = collection.update_one(
            {"_id": ObjectId(result_id)},
            {"$set": result.model_dump()}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid result ID format")
    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return {"message": "Lab result updated successfully"}