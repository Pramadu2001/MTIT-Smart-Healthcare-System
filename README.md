# 🏥 MTIT Smart Healthcare System

A modern, highly scalable microservices-based Healthcare Management System built using **Python FastAPI**, **React**, and **MongoDB**. 

This repository implements an API Gateway architecture to gracefully manage 6 independent microservices that handle localized patient operations seamlessly.

---

## 🏗️ Architecture

The system is separated into three massive core components: 
1. **Frontend / UI Layer:** A dynamic React (Vite) interface that pulls from the Central API Gateway.
2. **API Gateway:** A single entry point (Port 8000) written beautifully with FastAPI that distributes routing and load balances.
3. **Microservices (The Backend):** 6 asynchronous independent services communicating with MongoDB Atlas via Motor.

### 🌐 Microservices Ecosystem
| Microservice | Internal Port | Database Strategy | Responsibilities |
| --- | --- | --- | --- |
| `patient-service` | 8001 | MongoDB | Core patient data and lifecycle management |
| `doctor-service` | 8002 | MongoDB | Doctor directory, scheduling, and specialization tracking |
| `appointment-service` | 8003 | MongoDB | Cross-reference temporal availability tracking |
| `prescription-service` | 8004 | MongoDB | Medicine history and digital prescriptions |
| `lab-service` | 8005 | MongoDB | Lab result recordings, diagnosis processing |
| `payment-service` | 8006 | MongoDB | Payment tracking and cashier logic |

---

## 🚀 Getting Started

To spin up the ecosystem locally, clone the repository and navigate through the separated layers setup:

### 1. ⚙️ Setup Environment Config
Each microservice requires a valid connection to MongoDB Atlas.
Inside **each** of the services (`services/patient-service`, `services/doctor-service`, etc.), create a **`.env`** file with the following variables:
```env
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=<YOUR_DB_NAME>
```

### 2. ⚡ Booting Microservices
You can run the microservices via standard `uvicorn` mapping, or automatically launch the app via python!

For each microservice inside `/services/<service-name>`:
```bash
# 1. Activate your virtual environment
python -m venv venv
venv\Scripts\activate # (on Windows)

# 2. Install dependencies
pip install -r requirements.txt

# 3. Spin up the specific internal python service
python main.py
```

### 3. 🛡️ Booting the API Gateway
The Front-end does not talk directly to the microservices. Instead, it accesses data via the Gateway running at `http://localhost:8000`.

```bash
cd api-gateway
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 4. 🎨 Booting the React Frontend
Finally, run the incredible user interface using Vite.

```bash
cd frontend
npm install
npm start
```

---

## 🛠️ Technology Stack
* **Python 3.10+**
* **FastAPI** (Extremely fast server, typed endpoints)
* **Motor / PyMongo** (Asynchronous non-blocking MongoDB drivers)
* **React 18 + Vite** (High-performance web architecture)
* **TailwindCSS (Or Custom Components)** (Styling standard)

---

## 🔐 Maintenance
When creating new endpoints, remember to:
- Write Pydantic Models inside `<service>/models.py`.
- Configure endpoints inside `<service>/routes.py`.
- Allow the Gateway (`api-gateway/app.py`) to auto-proxy the subpath!

⭐️ Enjoy exploring the MTIT Smart Healthcare System!
