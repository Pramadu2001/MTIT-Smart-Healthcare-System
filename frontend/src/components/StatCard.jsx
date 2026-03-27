import React from 'react';

export default function StatCard({ label, value, color = "#6366f1", sub, icon }) {
    return (
        <div style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: "20px 18px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.02)",
            border: "1px solid #f0f2f5",
            transition: "all 0.2s",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12
            }}>
                <span style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.2 }}>
                    {value}
                </span>
                {icon && <span style={{ fontSize: 28, opacity: 0.6 }}>{icon}</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", marginBottom: 4 }}>
                {label}
            </div>
            {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
        </div>
    );
}