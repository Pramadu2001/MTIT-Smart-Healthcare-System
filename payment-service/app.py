from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB config
app.config["MONGO_URI"] = "mongodb://localhost:27017/healthcareDB"
mongo = PyMongo(app)

# Helper function
def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# -------------------------------
# GET all payments
# -------------------------------
@app.route("/payments", methods=["GET"])
def get_payments():
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
# UPDATE payment (status or details)
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
