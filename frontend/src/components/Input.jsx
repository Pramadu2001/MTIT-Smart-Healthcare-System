import React, { useState } from 'react';

export default function Input({ label, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
            {label && (
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", letterSpacing: "-0.2px" }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    padding: "11px 14px",
                    borderRadius: 14,
                    border: `1.5px solid ${isFocused ? "#94a3b8" : "#e9edf2"}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "'Inter', sans-serif",
                    transition: "border 0.2s",
                    background: "#ffffff",
                    color: "#0f172a",
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
        </div>
    );
}