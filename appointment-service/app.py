from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flasgger import Swagger
from bson import ObjectId

app = Flask(__name__)
CORS(app)
Swagger(app)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["healthcare"]
appointments_col = db["appointments"]

# Helper to convert MongoDB doc to JSON-safe dict
def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ── GET all appointments ──────────────────────────────
@app.route("/appointments", methods=["GET"])
def get_appointments():
    """
    Get all appointments
    ---
    tags:
      - Appointments
    responses:
      200:
        description: List of all appointments
    """
    appointments = [serialize(a) for a in appointments_col.find()]
    return jsonify({"appointments": appointments}), 200

# ── POST - Book new appointment ───────────────────────
@app.route("/appointments", methods=["POST"])
def book_appointment():
    """
    Book a new appointment
    ---
    tags:
      - Appointments
    parameters:
      - in: body
        name: appointment
        required: true
        schema:
          type: object
          required:
            - patient_name
            - doctor_name
            - date
            - time
            - reason
          properties:
            patient_name:
              type: string
              example: "John Doe"
            doctor_name:
              type: string
              example: "Dr. Smith"
            date:
              type: string
              example: "2026-04-01"
            time:
              type: string
              example: "10:30 AM"
            reason:
              type: string
              example: "Fever and headache"
            status:
              type: string
              example: "Pending"
    responses:
      201:
        description: Appointment booked successfully
      400:
        description: Missing required fields
    """
    data = request.get_json()
    required = ["patient_name", "doctor_name", "date", "time", "reason"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400
    data.setdefault("status", "Pending")
    result = appointments_col.insert_one(data)
    return jsonify({
        "message": "Appointment booked successfully",
        "id": str(result.inserted_id)
    }), 201

# ── GET single appointment ────────────────────────────
@app.route("/appointments/<appointment_id>", methods=["GET"])
def get_appointment(appointment_id):
    """
    Get a single appointment by ID
    ---
    tags:
      - Appointments
    parameters:
      - in: path
        name: appointment_id
        type: string
        required: true
    responses:
      200:
        description: Appointment found
      404:
        description: Not found
    """
    try:
        appt = appointments_col.find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        return jsonify({"error": "Invalid ID format"}), 400
    if appt:
        return jsonify(serialize(appt)), 200
    return jsonify({"error": "Appointment not found"}), 404

# ── PUT - Update appointment ──────────────────────────
@app.route("/appointments/<appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):
    """
    Update an appointment
    ---
    tags:
      - Appointments
    parameters:
      - in: path
        name: appointment_id
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            status:
              type: string
              example: "Confirmed"
    responses:
      200:
        description: Updated successfully
      404:
        description: Not found
    """
    data = request.get_json()
    try:
        result = appointments_col.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": data}
        )
    except Exception:
        return jsonify({"error": "Invalid ID format"}), 400
    if result.matched_count == 0:
        return jsonify({"error": "Appointment not found"}), 404
    return jsonify({"message": "Appointment updated successfully"}), 200

# ── DELETE appointment ────────────────────────────────
@app.route("/appointments/<appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    """
    Delete an appointment
    ---
    tags:
      - Appointments
    parameters:
      - in: path
        name: appointment_id
        type: string
        required: true
    responses:
      200:
        description: Deleted successfully
      404:
        description: Not found
    """
    try:
        result = appointments_col.delete_one({"_id": ObjectId(appointment_id)})
    except Exception:
        return jsonify({"error": "Invalid ID format"}), 400
    if result.deleted_count == 0:
        return jsonify({"error": "Appointment not found"}), 404
    return jsonify({"message": "Appointment deleted successfully"}), 200


if __name__ == "__main__":
    app.run(port=8003, debug=True)  # ✅ Port 8003