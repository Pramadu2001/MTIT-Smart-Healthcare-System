import React from 'react';

export default function Badge({ label, color = "#6366f1" }) {
    return (
        <span
            style={{
                background: `${color}12`,
                color,
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 40,
                border: `1px solid ${color}20`,
            }}
        >
            {label}
        </span>
    );
}