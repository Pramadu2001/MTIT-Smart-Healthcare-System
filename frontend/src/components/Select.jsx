import React from 'react';

export default function Select({ label, children, ...props }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
            {label && (
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                    {label}
                </label>
            )}
            <select
                style={{
                    padding: "11px 14px",
                    borderRadius: 14,
                    border: "1.5px solid #e9edf2",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "'Inter', sans-serif",
                    background: "#fff",
                    cursor: "pointer",
                }}
                {...props}
            >
                {children}
            </select>
        </div>
    );
}