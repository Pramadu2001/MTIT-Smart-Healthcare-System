import React from 'react';

export default function Table({ cols, rows, emptyMsg = "No records found" }) {
    if (rows.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "56px 20px", color: "#94a3b8", fontSize: 14 }}>
                {emptyMsg}
            </div>
        );
    }
    
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #edf2f7" }}>
                        {cols.map(col => (
                            <th
                                key={col.key}
                                style={{
                                    padding: "14px 16px",
                                    textAlign: "left",
                                    fontWeight: 600,
                                    color: "#475569",
                                    fontSize: 12
                                }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr
                            key={index}
                            style={{
                                borderBottom: "1px solid #f8fafc",
                                transition: "background 0.1s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fafcff"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            {cols.map(col => (
                                <td
                                    key={col.key}
                                    style={{
                                        padding: "14px 16px",
                                        color: "#1e293b",
                                        verticalAlign: "middle"
                                    }}
                                >
                                    {col.render ? col.render(row) : (row[col.key] ?? "—")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}