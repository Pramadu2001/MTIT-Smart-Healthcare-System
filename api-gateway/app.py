from fastapi import FastAPI, Request, HTTPException, Response, Body
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Service registry - all microservice base URLs
SERVICES = {
    "patients":      "http://localhost:8001",
    "doctors":       "http://localhost:8002",
    "appointments":  "http://localhost:8003",
    "prescriptions": "http://localhost:8004",
    "lab-results":   "http://localhost:8005",
    "payments":      "http://localhost:8006",
}

tags_metadata = [
    {
        "name": svc.capitalize().replace("-", " "),
        "description": f"Manage {svc[:-1] if svc.endswith('s') else svc} details"
    } for svc in SERVICES.keys()
]

app = FastAPI(
    title="Medicore-Healthcare-System",
    description="Centralized API Gateway routing to localized microservices cleanly.",
    openapi_tags=tags_metadata
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/", tags=["Gateway System Info"])
async def gateway_root():
    return {
        "status": "online", 
        "message": "Welcome to the MediCore API Gateway. The system is running successfully."
    }

@app.get("/health", tags=["Gateway System Info"])
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


# ── Dynamically Generate & Group Routes for Swagger (/docs) ───

def register_service_routes(svc: str):
    tag = svc.capitalize().replace("-", " ")
    singular = tag[:-1] if tag.endswith('s') else tag
    safe_name = svc.replace("-", "_")

    # Defining handlers inside the factory securely isolates variable closures
    async def get_all():
        return await proxy_request(svc, method="GET")
    get_all.__name__ = f"get_all_{safe_name}s"

    async def create_item(data: dict = Body(...)):
        return await proxy_request(svc, method="POST", data=data)
    create_item.__name__ = f"add_{safe_name}"

    async def get_item(id: str):
        return await proxy_request(svc, path=id, method="GET")
    get_item.__name__ = f"get_{safe_name}"

    async def update_item(id: str, data: dict = Body(...)):
        return await proxy_request(svc, path=id, method="PUT", data=data)
    update_item.__name__ = f"update_{safe_name}"

    async def delete_item(id: str):
        return await proxy_request(svc, path=id, method="DELETE")
    delete_item.__name__ = f"delete_{safe_name}"

    # Connect them to FastAPI router sequentially
    app.add_api_route(f"/{svc}", get_all, methods=["GET"], tags=[tag], summary=f"Get {tag}")
    app.add_api_route(f"/{svc}", create_item, methods=["POST"], tags=[tag], summary=f"Add {singular}")
    app.add_api_route(f"/{svc}/{{id}}", get_item, methods=["GET"], tags=[tag], summary=f"Get {singular}")
    app.add_api_route(f"/{svc}/{{id}}", update_item, methods=["PUT"], tags=[tag], summary=f"Update {singular}")
    app.add_api_route(f"/{svc}/{{id}}", delete_item, methods=["DELETE"], tags=[tag], summary=f"Delete {singular}")

# Actually register them
for service in SERVICES.keys():
    register_service_routes(service)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
