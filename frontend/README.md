# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


# 🏥 Healthcare Microservices System
**IT4020 - Modern Topics in IT | SLIIT | 2026**

---

## 📁 Project Structure
```
healthcare-microservices/
├── api-gateway/           ← Routes all traffic (port 5000)
├── patient-service/       ← Member 1 (port 5001)
├── doctor-service/        ← Member 2 (port 5002)
├── appointment-service/   ← Member 3 (port 5003)
├── prescription-service/  ← Member 4 (port 5004)
├── lab-service/           ← Member 5 (port 5005)
├── payment-service/       ← Member 6 (port 5006)
└── frontend/              ← React UI (open index.html)
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
| Patients | http://localhost:5001/patients |
| Doctors | http://localhost:5002/doctors |
| Appointments | http://localhost:5003/appointments |
| Prescriptions | http://localhost:5004/prescriptions |
| Labs | http://localhost:5005/labs |
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
