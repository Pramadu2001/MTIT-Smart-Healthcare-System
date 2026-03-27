import React from 'react';

export default function ErrorBox({ msg }) {
    return (
        <div
            style={{
                padding: "16px 20px",
                background: "#fef9f9",
                border: "1px solid #ffe2e0",
                borderRadius: 20,
                color: "#c2410c",
                fontSize: 13,
                marginBottom: 20,
            }}
        >
            ⚠️ {msg}
        </div>
    );
}