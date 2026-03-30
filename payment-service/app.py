from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from flasgger import Swagger

app = Flask(__name__)
CORS(app)

app.config["SWAGGER"] = {
    "title": "Payment Service API",
    "uiversion": 3
}

app.config["MONGO_URI"] = "mongodb+srv://MTIT:MTIT123456@cluster1.ddh6mzk.mongodb.net/healthcareDB?retryWrites=true&w=majority"

swagger = Swagger(app)
mongo = PyMongo(app)


def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    if "created_at" in doc and doc["created_at"]:
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


@app.route("/")
def home():
    return "Payment Service Running on Port 5006"


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
    return jsonify({"payments": [format_doc(p) for p in payments]}), 200


@app.route("/payments", methods=["POST"])
def add_payment():
    """
    Create a new payment
    ---
    tags:
      - Payments
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - patient_id
          properties:
            patient_id:
              type: string
              example: "P123"
            amount:
              type: number
              example: 500
            method:
              type: string
              example: "card"
            status:
              type: string
              example: "pending"
    responses:
      201:
        description: Payment created successfully
      400:
        description: patient_id is required
    """
    data = request.get_json()

    if not data or not data.get("patient_id"):
        return jsonify({"error": "patient_id is required"}), 400

    payment = {
        "patient_id": data.get("patient_id"),
        "amount": data.get("amount", 0),
        "method": data.get("method", "cash"),
        "status": data.get("status", "pending"),
        "created_at": datetime.utcnow()
    }

    result = mongo.db.payments.insert_one(payment)

    return jsonify({
        "message": "Payment created successfully",
        "id": str(result.inserted_id)
    }), 201


@app.route("/payments/patient/<patient_id>", methods=["GET"])
def get_payments_by_patient(patient_id):
    """
    Get payments by patient ID
    ---
    tags:
      - Payments
    parameters:
      - name: patient_id
        in: path
        type: string
        required: true
        description: Patient ID
    responses:
      200:
        description: Payments list
    """
    payments = mongo.db.payments.find({"patient_id": patient_id})
    return jsonify({"payments": [format_doc(p) for p in payments]}), 200


@app.route("/payments/<id>", methods=["GET"])
def get_payment_by_id(id):
    """
    Get payment by ID
    ---
    tags:
      - Payments
    parameters:
      - name: id
        in: path
        type: string
        required: true
        description: MongoDB Payment ID
    responses:
      200:
        description: Payment found
      400:
        description: Invalid payment ID
      404:
        description: Payment not found
    """
    try:
        payment = mongo.db.payments.find_one({"_id": ObjectId(id)})
        if not payment:
            return jsonify({"error": "Payment not found"}), 404
        return jsonify(format_doc(payment)), 200
    except InvalidId:
        return jsonify({"error": "Invalid payment ID"}), 400


@app.route("/payments/<id>", methods=["PUT"])
def update_payment(id):
    """
    Update payment
    ---
    tags:
      - Payments
    parameters:
      - name: id
        in: path
        type: string
        required: true
        description: MongoDB Payment ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            amount:
              type: number
              example: 750
            method:
              type: string
              example: "online"
            status:
              type: string
              example: "completed"
    responses:
      200:
        description: Payment updated successfully
      400:
        description: Invalid payment ID or empty body
      404:
        description: Payment not found
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        allowed_fields = ["amount", "method", "status", "patient_id"]
        update_data = {key: value for key, value in data.items() if key in allowed_fields}

        if not update_data:
            return jsonify({"error": "No valid fields provided"}), 400

        result = mongo.db.payments.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Payment not found"}), 404

        return jsonify({"message": "Payment updated successfully"}), 200

    except InvalidId:
        return jsonify({"error": "Invalid payment ID"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/payments/<id>", methods=["DELETE"])
def delete_payment(id):
    """
    Delete payment
    ---
    tags:
      - Payments
    parameters:
      - name: id
        in: path
        type: string
        required: true
        description: MongoDB Payment ID
    responses:
      200:
        description: Payment deleted successfully
      400:
        description: Invalid payment ID
      404:
        description: Payment not found
    """
    try:
        result = mongo.db.payments.delete_one({"_id": ObjectId(id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Payment not found"}), 404

        return jsonify({"message": "Payment deleted successfully"}), 200

    except InvalidId:
        return jsonify({"error": "Invalid payment ID"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8006, debug=True)
