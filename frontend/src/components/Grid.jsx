import React from 'react';

export default function Grid({ cols = 2, gap = 16, children }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap,
            }}
        >
            {children}
        </div>
    );
}