const BASE = "http://localhost:8001/patients";

export const getPatients = () => fetch(BASE).then(r => r.json());

export const getPatient = (id) => fetch(`${BASE}/${id}`).then(r => r.json());

export const createPatient = (data) => fetch(BASE, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
}).then(r => r.json());

export const updatePatient = (id, data) => fetch(`${BASE}/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
}).then(r => r.json());

export const deletePatient = (id) => fetch(`${BASE}/${id}`, {
  method: "DELETE"
}).then(r => r.json());