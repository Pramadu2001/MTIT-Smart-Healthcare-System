import React from 'react';

export default function Btn({ children, onClick, variant = "primary", type = "button", style: extra, disabled }) {
    const base = {
        padding: "8px 18px",
        borderRadius: 40,
        border: "none",
        fontWeight: 500,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Inter', sans-serif",
        transition: "all 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
    };
    
    const variants = {
        primary: { background: "#0f172a", color: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
        danger: { background: "#fff1f0", color: "#e11d48", border: "1px solid #ffe4e2" },
        ghost: { background: "#ffffff", color: "#334155", border: "1px solid #e9ecef" },
        success: { background: "#ecfdf5", color: "#0b5e42", border: "1px solid #d1fae5" },
    };
    
    const handleMouseEnter = (e) => {
        if (!disabled) {
            e.currentTarget.style.opacity = "0.85";
            e.currentTarget.style.transform = "translateY(-1px)";
        }
    };
    
    const handleMouseLeave = (e) => {
        if (!disabled) {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
        }
    };
    
    return (
        <button
            type={type}
            style={{ ...base, ...variants[variant], ...extra }}
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </button>
    );
}