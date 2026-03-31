# MediCore Healthcare Management System

A modern, minimalist healthcare management system built with React and microservices architecture.

## Features

- 🏥 Patient Management (CRUD operations)
- 📊 Real-time Dashboard with service health monitoring
- 🎨 Modern, responsive UI with smooth animations
- 🌙 Clean minimalist design
- 📱 Fully responsive (mobile, tablet, desktop, large screens)
- 🔌 Microservices integration via API Gateway

## Tech Stack

- **Frontend**: React 18, Vite, JavaScript (ES6+)
- **Styling**: CSS-in-JS, Flexbox, CSS Grid
- **API**: REST API with centralized gateway
- **Architecture**: Component-based, modular structure

## 📁 Project Structure
```
healthcare-microservices/
├── api-gateway/           ← Routes all traffic (port 8000)
├── patient-service/       ← Member 1 (port 8001)
├── doctor-service/        ← Member 2 (port 8002)
├── appointment-service/   ← Member 3 (port 8003)
├── prescription-service/  ← Member 4 (port 8004)
├── lab-service/           ← Member 5 (port 8005)
├── payment-service/       ← Member 6 (port 8006)
└── frontend/              ← React UI 
```

---

## ⚙️ Prerequisites
- Python 3.8+
- MongoDB running on localhost:27017
- A browser (for frontend)

---

## 🚀 How to Run

### Step 1 — Install dependencies (do this once per service)
```bash
cd patient-service && pip install -r requirements.txt
cd doctor-service && pip install -r requirements.txt
cd appointment-service && pip install -r requirements.txt
cd prescription-service && pip install -r requirements.txt
cd lab-service && pip install -r requirements.txt
cd payment-service && pip install -r requirements.txt
cd api-gateway && pip install -r requirements.txt
```

### Step 2 — Start MongoDB
Make sure MongoDB is running. Default: mongodb://localhost:27017

### Step 3 — Start all services (open 7 terminals)
```bash
# Terminal 1
cd patient-service && python app.py

# Terminal 2
cd doctor-service && python app.py

# Terminal 3
cd appointment-service && python app.py

# Terminal 4
cd prescription-service && python app.py

# Terminal 5
cd lab-service && python app.py

# Terminal 6
cd payment-service && python app.py

# Terminal 7 — Gateway (start this last)
cd api-gateway && python app.py
```

### Step 4 — Open the Frontend
Open `frontend/index.html` in your browser.

---

## 🌐 API Endpoints

### Direct access (each service)
| Service | URL |
|---------|-----|
| Patients | http://localhost:8001/patients |
| Doctors | http://localhost:8002/doctors |
| Appointments | http://localhost:8003/appointments |
| Prescriptions | http://localhost:8004/prescriptions |
| Labs | http://localhost:8005/labs |
| Payments | http://localhost:5006/payments |

### Via API Gateway (single port!)
| Service | URL |
|---------|-----|
| Patients | http://localhost:5000/patients |
| Doctors | http://localhost:5000/doctors |
| Appointments | http://localhost:5000/appointments |
| Prescriptions | http://localhost:5000/prescriptions |
| Labs | http://localhost:5000/labs |
| Payments | http://localhost:5000/payments |
| Health Check | http://localhost:5000/health |

---

## 📸 Screenshots for Slide Deck

Use **Postman** to:
1. GET `http://localhost:5001/patients` → screenshot (direct)
2. GET `http://localhost:5000/patients` → screenshot (via gateway)
3. POST to both → screenshot add functionality

---

## 👥 Group Members & Contributions
| Member | Service | Port |
|--------|---------|------|
| Member 1 | Patient Service | 5001 |
| Member 2 | Doctor Service | 5002 |
| Member 3 | Appointment Service | 5003 |
| Member 4 | Prescription Service | 5004 |
| Member 5 | Lab Service | 5005 |
| Member 6 | Payment Service | 5006 |
