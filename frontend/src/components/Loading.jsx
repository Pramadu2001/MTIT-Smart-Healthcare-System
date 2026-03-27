import React from 'react';

export default function Loading() {
    return (
        <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    border: "2px solid #e2e8f0",
                    borderTopColor: "#6366f1",
                    margin: "0 auto 12px",
                    animation: "spin 0.8s linear infinite",
                }}
            />
            Loading...
        </div>
    );
}