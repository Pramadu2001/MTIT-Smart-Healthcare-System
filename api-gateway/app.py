from flask import Flask, jsonify, request
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Service registry - all microservice base URLs
SERVICES = {
    "patients":      "http://localhost:8001",
    "doctors":       "http://localhost:8002",
    "appointments":  "http://localhost:8003",
    "prescriptions": "http://localhost:8004",
    "lab-results":   "http://localhost:8005",
    "payments":      "http://localhost:8006",
}

def proxy_request(service, path="", method="GET", data=None):
    if service not in SERVICES:
        return jsonify({"error": f"Service '{service}' not found"}), 404
    url = f"{SERVICES[service]}/{service}"
    if path:
        url = f"{url}/{path}"
    try:
        if method == "GET":
            resp = requests.get(url, timeout=5)
        elif method == "POST":
            resp = requests.post(url, json=data, timeout=5)
        elif method == "PUT":
            resp = requests.put(url, json=data, timeout=5)
        elif method == "DELETE":
            resp = requests.delete(url, timeout=5)
        else:
            return jsonify({"error": "Method not supported"}), 405
        return jsonify(resp.json()), resp.status_code
    except requests.exceptions.ConnectionError:
        return jsonify({"error": f"Service '{service}' is unavailable"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── GET all ──────────────────────────────────────────────
@app.route("/<service>", methods=["GET"])
def gateway_get_all(service):
    return proxy_request(service, method="GET")

# ── POST (create) ────────────────────────────────────────
@app.route("/<service>", methods=["POST"])
def gateway_post(service):
    return proxy_request(service, method="POST", data=request.json)

# ── GET one ──────────────────────────────────────────────
@app.route("/<service>/<id>", methods=["GET"])
def gateway_get_one(service, id):
    return proxy_request(service, path=id, method="GET")

# ── PUT (update) ─────────────────────────────────────────
@app.route("/<service>/<id>", methods=["PUT"])
def gateway_put(service, id):
    return proxy_request(service, path=id, method="PUT", data=request.json)

# ── DELETE ───────────────────────────────────────────────
@app.route("/<service>/<id>", methods=["DELETE"])
def gateway_delete(service, id):
    return proxy_request(service, path=id, method="DELETE")

# ── Health check ─────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    statuses = {}
    for name, url in SERVICES.items():
        try:
            resp = requests.get(f"{url}/{name}", timeout=2)
            statuses[name] = "UP" if resp.status_code == 200 else "DEGRADED"
        except Exception:
            statuses[name] = "DOWN"
    return jsonify({"gateway": "UP", "services": statuses})

if __name__ == "__main__":
    app.run(port=8000, debug=True)
