import React, { useState, useEffect } from 'react';
import { GW } from '../utils/api';
import { StatCard, Card, Badge } from '../components/UI';

const SERVICES = [
    { name: "Patient", endpoint: "patients", port: 8001, color: "#3b82f6", icon: "👤", key: "patients" },
    { name: "Doctor", endpoint: "doctors", port: 8002, color: "#10b981", icon: "👨‍⚕️", key: "doctors" },
    { name: "Appointment", endpoint: "appointments", port: 8003, color: "#f59e0b", icon: "📅", key: "appointments" },
    { name: "Prescription", endpoint: "prescriptions", port: 8004, color: "#ef4444", icon: "💊", key: "prescriptions" },
    { name: "Lab", endpoint: "lab-results", port: 8005, color: "#8b5cf6", icon: "🔬", key: "results" },
    { name: "Payment", endpoint: "payments", port: 8006, color: "#14b8a6", icon: "💰", key: "payments" },
];

export default function Dashboard() {
    const [counts, setCounts] = useState({});
    const [statuses, setStatuses] = useState({});

    useEffect(() => {
        SERVICES.forEach(async (svc) => {
            try {
                const response = await fetch(`${GW}/${svc.endpoint}`);
                const data = await response.json();
                const arr = data[svc.key] || [];
                setCounts(prev => ({ ...prev, [svc.endpoint]: arr.length }));
                setStatuses(prev => ({ ...prev, [svc.endpoint]: "up" }));
            } catch {
                setStatuses(prev => ({ ...prev, [svc.endpoint]: "down" }));
            }
        });
    }, []);

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Dashboard</h2>
                <p style={{ color: "#5b6e8c", fontSize: 13 }}>System overview & service health</p>
            </div>
            
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 16,
                marginBottom: 32
            }}>
                {SERVICES.map(svc => (
                    <StatCard
                        key={svc.endpoint}
                        label={svc.name}
                        value={counts[svc.endpoint] ?? "—"}
                        color={svc.color}
                        sub={`Port ${svc.port}`}
                        icon={svc.icon}
                    />
                ))}
            </div>
            
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24
            }}>
                <Card>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #eff3f6", fontWeight: 700 }}>
                        🟢 Service Health
                    </div>
                    <div>
                        {SERVICES.map(svc => (
                            <div
                                key={svc.endpoint}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "14px 24px",
                                    borderBottom: "1px solid #f8fafc",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500 }}>{svc.name}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                        localhost:{svc.port}
                                    </div>
                                </div>
                                <Badge
                                    label={
                                        statuses[svc.endpoint] === "up"
                                            ? "Online"
                                            : statuses[svc.endpoint] === "down"
                                            ? "Offline"
                                            : "Checking..."
                                    }
                                    color={
                                        statuses[svc.endpoint] === "up"
                                            ? "#10b981"
                                            : statuses[svc.endpoint] === "down"
                                            ? "#ef4444"
                                            : "#f59e0b"
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </Card>
                
                <Card>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #eff3f6", fontWeight: 700 }}>
                        ⚙️ Architecture
                    </div>
                    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                        {[
                            { label: "Pattern", value: "Microservices" },
                            { label: "Gateway", value: "Port 8000" },
                            { label: "Backend", value: "Python Flask" },
                            { label: "Database", value: "MongoDB / service" },
                            { label: "Frontend", value: "React + Vite" },
                            { label: "Services", value: "6 independent" },
                        ].map(row => (
                            <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#64748b" }}>{row.label}</span>
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}