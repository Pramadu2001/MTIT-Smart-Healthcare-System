from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title ="Medicore-Healthcare-System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service registry - all microservice base URLs
SERVICES = {
    "patients":      "http://localhost:8001",
    "doctors":       "http://localhost:8002",
    "appointments":  "http://localhost:8003",
    "prescriptions": "http://localhost:8004",
    "lab-results":   "http://localhost:8005",
    "payments":      "http://localhost:8006",
}

async def proxy_request(service: str, path: str = "", method: str = "GET", data=None):
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Service '{service}' not found")
    url = f"{SERVICES[service]}/{service}"
    if path:
        url = f"{url}/{path}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.request(method, url, json=data, timeout=15.0)
            return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get("Content-Type", "application/json"))
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail=f"Service '{service}' is unavailable")
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail=f"Service '{service}' timed out - try again")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def gateway_root():
    return {
        "status": "online", 
        "message": "Welcome to the MediCore API Gateway. The system is running successfully."
    }

@app.get("/health")
async def health():
    statuses = {}
    async with httpx.AsyncClient() as client:
        for name, url_base in SERVICES.items():
            try:
                resp = await client.get(f"{url_base}/{name}", timeout=2.0)
                statuses[name] = "UP" if resp.status_code == 200 else "DEGRADED"
            except Exception:
                statuses[name] = "DOWN"
    return {"gateway": "UP", "services": statuses}

# ── Generic routes ──────────────────────────────────────────────

@app.api_route("/{service}", methods=["GET", "POST"])
async def gateway_base(service: str, request: Request):
    data = None
    if request.method in ["POST"]:
        try:
            data = await request.json()
        except:
            pass
    return await proxy_request(service, method=request.method, data=data)

@app.api_route("/{service}/{id}", methods=["GET", "PUT", "DELETE"])
async def gateway_item(service: str, id: str, request: Request):
    data = None
    if request.method in ["PUT"]:
        try:
            data = await request.json()
        except:
            pass
    return await proxy_request(service, path=id, method=request.method, data=data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
