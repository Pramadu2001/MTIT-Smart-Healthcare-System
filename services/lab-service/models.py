from pydantic import BaseModel
from typing import Optional

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
