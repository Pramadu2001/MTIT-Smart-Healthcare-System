import React from 'react';

export default function Card({ children, style: extra }) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
                border: "1px solid #eff3f6",
                overflow: "hidden",
                ...extra,
            }}
        >
            {children}
        </div>
    );
}