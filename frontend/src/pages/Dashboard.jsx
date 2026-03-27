import { useEffect, useState } from "react";
import { GW } from "../utils";
import { StatCard, Card, Badge } from "../components/UI";

const SERVICES = [
  { name: "Patient Service",      endpoint: "patients",      port: 8001, color: "#0ea5e9", key: "patients" },
  { name: "Doctor Service",       endpoint: "doctors",       port: 8002, color: "#10b981", key: "doctors" },
  { name: "Appointment Service",  endpoint: "appointments",  port: 8003, color: "#f59e0b", key: "appointments" },
  { name: "Prescription Service", endpoint: "prescriptions", port: 8004, color: "#ef4444", key: "prescriptions" },
  { name: "Lab Service",          endpoint: "lab-results",   port: 8005, color: "#8b5cf6", key: "results" },
  { name: "Payment Service",      endpoint: "payments",      port: 8006, color: "#14b8a6", key: "payments" },
];

export default function Dashboard() {
  const [counts, setCounts]   = useState({});
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    SERVICES.forEach(async svc => {
      try {
        const r = await fetch(`${GW}/${svc.endpoint}`);
        const d = await r.json();
        const arr = d[svc.key] || [];
        setCounts(prev  => ({ ...prev,  [svc.endpoint]: arr.length }));
        setStatuses(prev => ({ ...prev, [svc.endpoint]: "up" }));
      } catch {
        setStatuses(prev => ({ ...prev, [svc.endpoint]: "down" }));
      }
    });
  }, []);

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16, marginBottom: 28 }}>
        {SERVICES.map(svc => (
          <StatCard
            key={svc.endpoint}
            label={svc.name.replace(" Service", "")}
            value={counts[svc.endpoint] ?? "—"}
            color={svc.color}
            sub={`Port ${svc.port}`}
          />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Service health */}
        <Card>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
            Service Health
          </div>
          <div style={{ padding: "8px 0" }}>
            {SERVICES.map(svc => (
              <div key={svc.endpoint} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 22px", borderBottom: "1px solid #f8fafc",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{svc.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>localhost:{svc.port}</div>
                </div>
                <Badge
                  label={statuses[svc.endpoint] === "up" ? "Online" : statuses[svc.endpoint] === "down" ? "Offline" : "Checking..."}
                  color={statuses[svc.endpoint] === "up" ? "#10b981" : statuses[svc.endpoint] === "down" ? "#ef4444" : "#f59e0b"}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Architecture info */}
        <Card>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
            System Architecture
          </div>
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Architecture",  value: "Microservices" },
              { label: "API Gateway",   value: "Port 8000 (single entry)" },
              { label: "Backend",       value: "Python Flask" },
              { label: "Database",      value: "MongoDB (per service)" },
              { label: "Frontend",      value: "React + Vite" },
              { label: "Services",      value: "6 independent microservices" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}