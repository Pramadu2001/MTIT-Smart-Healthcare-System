from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime
from flasgger import Swagger

app = Flask(__name__)
CORS(app)

# ✅ Swagger config
app.config['SWAGGER'] = {
    'title': 'Payment Service API',
    'uiversion': 3
}

swagger = Swagger(app)

# 🔥 MongoDB
app.config["MONGO_URI"] = "mongodb+srv://MTIT:MTIT123456@cluster1.ddh6mzk.mongodb.net/healthcareDB?retryWrites=true&w=majority"

mongo = PyMongo(app)
# -------------------------------
# Helper function
# -------------------------------
def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# -------------------------------
# HOME ROUTE
# -------------------------------
@app.route("/")
def home():
    return "💳 Payment Service Running on Port 5006"


# -------------------------------
# GET all payments
# -------------------------------
@app.route("/payments", methods=["GET"])
def get_payments():
    """
    Get all payments
    ---
    tags:
      - Payments
    responses:
      200:
        description: List of payments
    """
    payments = mongo.db.payments.find()
    return jsonify({
        "payments": [format_doc(p) for p in payments]
    })

# -------------------------------
# CREATE payment
# -------------------------------
@app.route("/payments", methods=["POST"])
def add_payment():
    data = request.json

    if not data or not data.get("patient_id"):
        return jsonify({"error": "patient_id is required"}), 400

    payment = {
        "patient_id": data.get("patient_id"),
        "amount": data.get("amount", 0),
        "method": data.get("method", "cash"),   # card / cash / online
        "status": data.get("status", "pending"),  # pending / completed / failed
        "created_at": datetime.utcnow()
    }

    result = mongo.db.payments.insert_one(payment)

    return jsonify({
        "message": "Payment created successfully",
        "id": str(result.inserted_id)
    }), 201


# -------------------------------
# GET payments by patient ID
# -------------------------------
@app.route("/payments/patient/<patient_id>", methods=["GET"])
def get_payments_by_patient(patient_id):
    payments = mongo.db.payments.find({"patient_id": patient_id})
    return jsonify({
        "payments": [format_doc(p) for p in payments]
    })


# -------------------------------
# UPDATE payment
# -------------------------------
@app.route("/payments/<id>", methods=["PUT"])
def update_payment(id):
    try:
        data = request.json

        mongo.db.payments.update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )

        return jsonify({"message": "Payment updated successfully"})
    except Exception:
        return jsonify({"error": "Invalid payment ID"}), 400


# -------------------------------
# DELETE payment
# -------------------------------
@app.route("/payments/<id>", methods=["DELETE"])
def delete_payment(id):
    try:
        mongo.db.payments.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Payment deleted successfully"})
    except Exception:
        return jsonify({"error": "Invalid payment ID"}), 400


# -------------------------------
# RUN SERVICE (PORT 5006)
# -------------------------------
if __name__ == "__main__":
    app.run(port=5006, debug=True)
