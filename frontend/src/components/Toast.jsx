import React from 'react';

export default function Toast({ toast }) {
    if (!toast) return null;
    
    const isError = toast.type === "err";
    
    return (
        <div style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10000,
            background: isError ? "#fef2f2" : "#ecfdf5",
            color: isError ? "#b91c1c" : "#065f46",
            padding: "12px 20px",
            borderRadius: 48,
            fontWeight: 500,
            fontSize: 13,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02)",
            borderLeft: `4px solid ${isError ? "#ef4444" : "#10b981"}`,
            backdropFilter: "blur(8px)",
            fontFamily: "'Inter', sans-serif",
            animation: "fadeIn 0.2s ease",
        }}>
            {toast.msg}
        </div>
    );
}