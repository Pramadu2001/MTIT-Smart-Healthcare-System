import { useEffect, useState } from "react";
import { getPatients, deletePatient } from "./patientApi";
import PatientForm from "./PatientForm";

const BLOOD_COLOR = {
    "A+": "#3b82f6", "A-": "#6366f1",
    "B+": "#f59e0b", "B-": "#ef4444",
    "O+": "#10b981", "O-": "#14b8a6",
    "AB+": "#8b5cf6", "AB-": "#ec4899",
};

function BloodBadge({ type }) {
    const color = BLOOD_COLOR[type] || "#9ca3af";
    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: `${color}12`,
            border: `1px solid ${color}30`,
            color,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.02em",
        }}>
            {type || "—"}
        </span>
    );
}

function GenderDot({ gender }) {
    const colors = { Male: "#3b82f6", Female: "#ec4899", Other: "#8b5cf6" };
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: colors[gender] || "#9ca3af",
                display: "inline-block",
                flexShrink: 0,
            }} />
            <span style={{ color: "#374151", fontSize: 13 }}>{gender || "—"}</span>
        </div>
    );
}

function Avatar({ name }) {
    const initials = name
        ? name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
        : "?";
    const hue = name
        ? name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360
        : 0;
    return (
        <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: `hsl(${hue}, 40%, 92%)`,
            color: `hsl(${hue}, 50%, 35%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            flexShrink: 0,
        }}>
            {initials}
        </div>
    );
}

function DeleteConfirm({ patient, onConfirm, onCancel }) {
    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 16,
        }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "28px 32px",
                    maxWidth: 380,
                    width: "100%",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ marginBottom: 8, fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Confirm Deletion
                </div>
                <p style={{ fontSize: 16, color: "#111827", fontFamily: "'Lora', Georgia, serif", marginBottom: 24, lineHeight: 1.5 }}>
                    Remove <strong>{patient.name}</strong> from records? This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: "11px", background: "none",
                            border: "1.5px solid #e5e7eb", borderRadius: 8,
                            fontSize: 13, fontFamily: "'DM Mono', monospace",
                            color: "#6b7280", cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: "11px", background: "#ef4444",
                            border: "1.5px solid #ef4444", borderRadius: 8,
                            fontSize: 13, fontFamily: "'DM Mono', monospace",
                            color: "#fff", cursor: "pointer",
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getPatients();
            setPatients(Array.isArray(data) ? data : data.patients || []);
        } catch {
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async () => {
        if (!confirmDelete) return;
        await deletePatient(confirmDelete.id);
        setConfirmDelete(null);
        load();
    };

    const filtered = patients.filter(p =>
        (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.contact || "").includes(search) ||
        (p.gender || "").toLowerCase().includes(search.toLowerCase())
    );

    if (showForm) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "#f9fafb",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "60px 16px",
                fontFamily: "'Lora', Georgia, serif",
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: "40px 40px",
                    width: "100%",
                    maxWidth: 520,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)",
                }}>
                    <PatientForm
                        existing={editing}
                        onDone={() => { setShowForm(false); setEditing(null); load(); }}
                        onCancel={() => { setShowForm(false); setEditing(null); }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f9fafb",
            padding: "48px 24px",
            fontFamily: "'Lora', Georgia, serif",
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 40,
                    flexWrap: "wrap",
                    gap: 16,
                }}>
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 500, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: "#9ca3af",
                            fontFamily: "'DM Mono', monospace", marginBottom: 6,
                        }}>
                            Patient Registry
                        </div>
                        <h1 style={{
                            fontSize: 28, fontWeight: 400, color: "#111827",
                            margin: 0, letterSpacing: "-0.6px",
                        }}>
                            Patients
                            <span style={{
                                marginLeft: 12, fontSize: 14, fontWeight: 400,
                                color: "#9ca3af", fontFamily: "'DM Mono', monospace",
                                letterSpacing: 0,
                            }}>
                                {!loading && `(${patients.length})`}
                            </span>
                        </h1>
                    </div>
                    <button
                        onClick={() => { setEditing(null); setShowForm(true); }}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "11px 20px",
                            background: "#111827", color: "#fff",
                            border: "none", borderRadius: 8,
                            fontSize: 13, fontFamily: "'DM Mono', monospace",
                            letterSpacing: "0.04em", cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#1f2937"}
                        onMouseLeave={e => e.currentTarget.style.background = "#111827"}
                    >
                        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                        New Patient
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: 28, position: "relative" }}>
                    <svg
                        style={{
                            position: "absolute", left: 14, top: "50%",
                            transform: "translateY(-50%)", color: "#9ca3af",
                            pointerEvents: "none",
                        }}
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                    >
                        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, gender, contact…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={{
                            width: "100%",
                            padding: "12px 14px 12px 36px",
                            border: `1.5px solid ${searchFocused ? "#111827" : "#e5e7eb"}`,
                            borderRadius: 10,
                            fontSize: 13,
                            fontFamily: "'DM Mono', monospace",
                            background: "#fff",
                            color: "#111827",
                            outline: "none",
                            transition: "border-color 0.2s",
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                {/* Table card */}
                <div style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid #f0f2f5",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 6px 20px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                }}>

                    {/* Table header */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 80px 100px 1fr 70px 100px",
                        padding: "14px 20px",
                        borderBottom: "1px solid #f3f4f6",
                        gap: 12,
                    }}>
                        {["Patient", "Age", "Gender", "Contact", "Blood", ""].map(h => (
                            <div key={h} style={{
                                fontSize: 10, fontWeight: 600,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                color: "#9ca3af", fontFamily: "'DM Mono', monospace",
                            }}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {loading ? (
                        <div style={{ padding: "60px 0", textAlign: "center" }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: "50%",
                                border: "2px solid #e5e7eb", borderTopColor: "#111827",
                                margin: "0 auto 12px",
                                animation: "spin 0.7s linear infinite",
                            }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                                Loading…
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            padding: "60px 0",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: 13,
                            fontFamily: "'DM Mono', monospace",
                        }}>
                            {search ? `No results for "${search}"` : "No patients yet"}
                        </div>
                    ) : (
                        filtered.map((p, i) => (
                            <div
                                key={p.id || i}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 80px 100px 1fr 70px 100px",
                                    padding: "16px 20px",
                                    borderBottom: i < filtered.length - 1 ? "1px solid #f9fafb" : "none",
                                    gap: 12,
                                    alignItems: "center",
                                    transition: "background 0.15s",
                                    cursor: "default",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                {/* Name + avatar */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                                    <Avatar name={p.name} />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 14, fontWeight: 500, color: "#111827",
                                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                        }}>
                                            {p.name || "—"}
                                        </div>
                                        {p.address && (
                                            <div style={{
                                                fontSize: 11, color: "#9ca3af",
                                                fontFamily: "'DM Mono', monospace",
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {p.address}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Age */}
                                <div style={{
                                    fontSize: 13, color: "#374151",
                                    fontFamily: "'DM Mono', monospace",
                                }}>
                                    {p.age ?? "—"}
                                </div>

                                {/* Gender */}
                                <GenderDot gender={p.gender} />

                                {/* Contact */}
                                <div style={{
                                    fontSize: 12, color: "#6b7280",
                                    fontFamily: "'DM Mono', monospace",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                    {p.contact || "—"}
                                </div>

                                {/* Blood type */}
                                <BloodBadge type={p.blood_type} />

                                {/* Actions */}
                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                    <button
                                        onClick={() => { setEditing(p); setShowForm(true); }}
                                        style={{
                                            padding: "6px 12px",
                                            background: "none",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontFamily: "'DM Mono', monospace",
                                            color: "#6b7280",
                                            cursor: "pointer",
                                            transition: "all 0.15s",
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = "#111827";
                                            e.currentTarget.style.color = "#111827";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = "#e5e7eb";
                                            e.currentTarget.style.color = "#6b7280";
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(p)}
                                        style={{
                                            padding: "6px 12px",
                                            background: "none",
                                            border: "1px solid #fee2e2",
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontFamily: "'DM Mono', monospace",
                                            color: "#ef4444",
                                            cursor: "pointer",
                                            transition: "all 0.15s",
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = "#fef2f2";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = "none";
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Footer count */}
                    {!loading && filtered.length > 0 && (
                        <div style={{
                            padding: "12px 20px",
                            borderTop: "1px solid #f3f4f6",
                            fontSize: 11,
                            fontFamily: "'DM Mono', monospace",
                            color: "#9ca3af",
                            display: "flex",
                            justifyContent: "space-between",
                        }}>
                            <span>
                                {search && filtered.length !== patients.length
                                    ? `${filtered.length} of ${patients.length} patients`
                                    : `${patients.length} patient${patients.length !== 1 ? "s" : ""}`}
                            </span>
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    style={{
                                        background: "none", border: "none",
                                        color: "#9ca3af", cursor: "pointer",
                                        fontSize: 11, fontFamily: "'DM Mono', monospace",
                                        textDecoration: "underline",
                                    }}
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <DeleteConfirm
                    patient={confirmDelete}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    );
}