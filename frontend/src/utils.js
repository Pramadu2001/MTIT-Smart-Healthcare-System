import { useState, useCallback } from "react";

// Base URL for API Gateway
export const GW = "http://localhost:8000";

// Simple fetch hook
export function useApi(endpoint) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${GW}/${endpoint}`);
      const d = await r.json();
      // Different services return data differently - handle based on endpoint
      let arr = [];
      if (endpoint === "patients") arr = d.patients || [];
      else if (endpoint === "doctors") arr = d.doctors || [];
      else if (endpoint === "appointments") arr = d.appointments || [];
      else if (endpoint === "prescriptions") arr = d.prescriptions || [];
      else if (endpoint === "lab-results") arr = d.results || [];
      else if (endpoint === "payments") arr = d.payments || [];
      else arr = d;
      
      setData(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error(`Error loading ${endpoint}:`, err);
      setError(`Cannot connect to ${endpoint} service`);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, loading, error, load, setData };
}

// Toast hook
export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

// Reusable POST/PUT/DELETE
export async function api(method, path, body) {
  const r = await fetch(`${GW}/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}