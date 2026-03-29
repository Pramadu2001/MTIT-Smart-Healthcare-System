import React from 'react';

export default function Modal({ title, onClose, children }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1050,
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 28,
                    padding: "24px 28px",
                    width: "100%",
                    maxWidth: 520,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                    animation: "fadeIn 0.2s ease",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20
                }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                        {title}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "#f1f5f9",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 16,
                            borderRadius: 40,
                            width: 32,
                            height: 32,
                            color: "#64748b",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => e.target.style.background = "#e2e8f0"}
                        onMouseLeave={e => e.target.style.background = "#f1f5f9"}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}