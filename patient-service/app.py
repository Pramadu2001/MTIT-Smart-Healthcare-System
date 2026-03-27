from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = "mongodb://localhost:27017/healthcareDB"
mongo = PyMongo(app)

def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@app.route("/patients", methods=["GET"])
def get_patients():
    patients = mongo.db.patients.find()
    return jsonify({"patients": [format_doc(p) for p in patients]})

@app.route("/patients", methods=["POST"])
def add_patient():
    data = request.json
    if not data or not data.get("name"):
        return jsonify({"error": "Name is required"}), 400
    result = mongo.db.patients.insert_one({
        "name": data.get("name"),
        "age": data.get("age", 0),
        "gender": data.get("gender", ""),
        "contact": data.get("contact", ""),
        "address": data.get("address", ""),
        "blood_type": data.get("blood_type", "")
    })
    return jsonify({"message": "Patient added successfully", "id": str(result.inserted_id)}), 201

@app.route("/patients/<id>", methods=["PUT"])
def update_patient(id):
    try:
        data = request.json
        mongo.db.patients.update_one({"_id": ObjectId(id)}, {"$set": data})
        return jsonify({"message": "Patient updated successfully"})
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

@app.route("/patients/<id>", methods=["DELETE"])
def delete_patient(id):
    try:
        mongo.db.patients.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Patient deleted successfully"})
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

if __name__ == "__main__":
    app.run(port=8001, debug=True)