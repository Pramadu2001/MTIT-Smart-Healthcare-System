from fastapi import APIRouter, HTTPException
from database import lab_results_collection
from models import LabResult
from bson import ObjectId

router = APIRouter(prefix="/lab-results", tags=["Lab Results"])

def format_result(result):
    result["_id"] = str(result["_id"])
    return result

@router.post("", status_code=201, summary="Add a new lab test result")
async def add_lab_result(result: LabResult):
    new_result = result.model_dump()
    inserted = await lab_results_collection.insert_one(new_result)
    new_result["_id"] = str(inserted.inserted_id)
    return {"message": "Lab result added successfully", "data": new_result}

@router.get("", summary="Get all lab test results")
async def get_all_results():
    results = []
    async for r in lab_results_collection.find():
        results.append(format_result(r))
    return {"results": results}

@router.get("/{patient_id}", summary="Get lab results by patient ID")
async def get_results_by_patient(patient_id: str):
    results = []
    async for r in lab_results_collection.find({"patient_id": patient_id}):
        results.append(format_result(r))
    if not results:
        raise HTTPException(status_code=404, detail="No results found for this patient")
    return results

@router.delete("/{result_id}", summary="Delete a lab result by ID")
async def delete_result(result_id: str):
    try:
        deleted = await lab_results_collection.delete_one({"_id": ObjectId(result_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid result ID format")
    if deleted.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return {"message": "Lab result deleted successfully"}

@router.put("/{result_id}", summary="Update a lab result by ID")
async def update_result(result_id: str, result: LabResult):
    try:
        updated = await lab_results_collection.update_one(
            {"_id": ObjectId(result_id)},
            {"$set": result.model_dump()}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid result ID format")
    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return {"message": "Lab result updated successfully"}
