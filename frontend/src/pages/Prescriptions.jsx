// src/pages/Prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast, api } from '../utils/api';
import {
    Btn,
    Modal,
    Input,
    Select,
    Table,
    Card,
    Badge,
    Loading,
    ErrorBox,
    Toast
} from '../components/UI';

const FREQUENCY_OPTIONS = ["Once daily", "Twice daily", "Three times daily", "Every 6 hours", "Every 8 hours", "As needed"];
const DURATION_OPTIONS   = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "3 months", "Ongoing"];

const FREQ_COLORS = {
    "Once daily":        "#10b981",
    "Twice daily":       "#3b82f6",
    "Three times daily": "#f59e0b",
    "Every 6 hours":     "#8b5cf6",
    "Every 8 hours":     "#ef4444",
    "As needed":         "#64748b",
};

const EMPTY_MEDICINE = { name: "", dosage: "", frequency: "Once daily", duration: "7 days" };

const EMPTY_FORM = {
    patient_name:  "",
    doctor_name:   "",
    medicines:   [{ ...EMPTY_MEDICINE }],
    notes:       "",
    date_issued: new Date().toISOString().slice(0, 10),
};

export default function Prescriptions() {
    const { data, loading, error, load } = useApi("prescriptions");
    const { toast, show } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm]           = useState(EMPTY_FORM);
    const [editId, setEditId]       = useState(null);
    const [search, setSearch]       = useState("");
    const [errors, setErrors]       = useState({});

    useEffect(() => { load(); }, [load]);

    // ── Medicine row helpers ───────────────────────────────
    const updateMedicine = (idx, key, value) => {
        setForm(prev => {
            const meds = [...prev.medicines];
            meds[idx] = { ...meds[idx], [key]: value };
            return { ...prev, medicines: meds };
        });
        // clear per-field error
        const errKey = `med_${idx}_${key}`;
        if (errors[errKey]) setErrors(prev => ({ ...prev, [errKey]: "" }));
    };

    const addMedicine = () =>
        setForm(prev => ({ ...prev, medicines: [...prev.medicines, { ...EMPTY_MEDICINE }] }));

    const removeMedicine = (idx) =>
        setForm(prev => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== idx) }));

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    };

    // ── Validation ────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.patient_name.trim()) e.patient_name = "Patient Name is required";
        if (!form.date_issued)       e.date_issued = "Issue date is required";
        if (form.medicines.length === 0) e.medicines = "Add at least one medicine";
        form.medicines.forEach((m, i) => {
            if (!m.name.trim())   e[`med_${i}_name`]   = "Medicine name required";
            if (!m.dosage.trim()) e[`med_${i}_dosage`] = "Dosage required";
        });
        return e;
    };

    const openAdd = () => {
        setForm({ ...EMPTY_FORM, medicines: [{ ...EMPTY_MEDICINE }], date_issued: new Date().toISOString().slice(0, 10) });
        setEditId(null);
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (rx) => {
        setForm({
            patient_name:  rx.patient_name  || rx.patient_id || "",
            doctor_name:   rx.doctor_name   || rx.doctor_id || "",
            medicines:   rx.medicines?.length ? rx.medicines : [{ ...EMPTY_MEDICINE }],
            notes:       rx.notes       || "",
            date_issued: rx.date_issued || new Date().toISOString().slice(0, 10),
        });
        setEditId(rx._id);
        setErrors({});
        setModalOpen(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        try {
            if (editId) {
                await api("PUT", `prescriptions/${editId}`, form);
                show("Prescription updated successfully! 💊");
            } else {
                await api("POST", "prescriptions", form);
                show("Prescription added successfully! 💊");
            }
            setModalOpen(false);
            load();
        } catch {
            show("Error saving prescription", "err");
        }
    };

    const deletePrescription = async (id) => {
        if (!window.confirm("Delete this prescription? This action cannot be undone.")) return;
        try {
            await api("DELETE", `prescriptions/${id}`);
            show("Prescription deleted");
            load();
        } catch {
            show("Error deleting prescription", "err");
        }
    };

    const filtered = data.filter(rx =>
        rx.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        rx.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
        rx.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
        rx.doctor_id?.toLowerCase().includes(search.toLowerCase()) ||
        rx.medicines?.some(m => m.name?.toLowerCase().includes(search.toLowerCase()))
    );

    const columns = [
        {
            key: "medicines",
            label: "Medicines",
            render: (rx) => {
                const meds = rx.medicines || [];
                // legacy single-medicine records
                if (!meds.length && rx.medication) {
                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18 }}>💊</span>
                            <div>
                                <div style={{ fontWeight: 600 }}>{rx.medication}</div>
                                <div style={{ fontSize: 11, color: "#94a3b8" }}>{rx.dosage}</div>
                            </div>
                        </div>
                    );
                }
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {meds.map((m, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 15 }}>💊</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</span>
                                <span style={{ fontSize: 11, color: "#64748b" }}>{m.dosage}</span>
                                {m.frequency && (
                                    <Badge label={m.frequency} color={FREQ_COLORS[m.frequency] || "#64748b"} />
                                )}
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {
            key: "patient_name",
            label: "Patient Name",
            render: (rx) => (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>👤</span>
                    <span style={{ fontWeight: 500, fontSize: 13, color: "#475569" }}>{rx.patient_name || rx.patient_id?.slice(-8) || "—"}</span>
                </div>
            )
        },
        {
            key: "doctor_name",
            label: "Doctor Name",
            render: (rx) => rx.doctor_name || rx.doctor_id
                ? <span style={{ fontWeight: 500, fontSize: 13, color: "#475569" }}>🩺 {rx.doctor_name || rx.doctor_id.slice(-8)}</span>
                : <span style={{ color: "#cbd5e1" }}>—</span>
        },
        {
            key: "duration",
            label: "Duration",
            render: (rx) => {
                const meds = rx.medicines || [];
                if (!meds.length) return rx.duration || "—";
                const durations = [...new Set(meds.map(m => m.duration).filter(Boolean))];
                return durations.join(", ") || "—";
            }
        },
        { key: "date_issued", label: "Date Issued", render: rx => (
            <span style={{ fontSize: 12, color: "#64748b" }}>📅 {rx.date_issued || "—"}</span>
        )},
        {
            key: "actions",
            label: "",
            render: rx => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => openEdit(rx)}>✏️ Edit</Btn>
                    <Btn variant="danger" onClick={() => deletePrescription(rx._id)}>🗑️ Delete</Btn>
                </div>
            )
        },
    ];

    return (
        <div>
            <Toast toast={toast} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                        💊 Prescriptions
                    </h2>
                    <p style={{ fontSize: 13, color: "#5b6e8c", marginTop: 2 }}>
                        {data.length} total records
                    </p>
                </div>
                <Btn onClick={openAdd}>+ New Prescription</Btn>
            </div>

            {error && <ErrorBox msg={error} />}

            {/* Table Card */}
            <Card>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f5" }}>
                    <input
                        type="text"
                        placeholder="🔍  Search by patient name, medicine or doctor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 40,
                            border: "1.5px solid #e9edf2",
                            fontSize: 13,
                            outline: "none",
                            fontFamily: "inherit",
                        }}
                    />
                </div>
                {loading
                    ? <Loading />
                    : <Table cols={columns} rows={filtered} emptyMsg="No prescriptions found" />
                }
            </Card>

            {/* Add / Edit Modal */}
            {modalOpen && (
                <Modal
                    title={editId ? "✏️ Edit Prescription" : "💊 New Prescription"}
                    onClose={() => setModalOpen(false)}
                >
                    <form onSubmit={submit}>
                        <div style={{ display: "grid", gap: 14 }}>

                            {/* Patient Name */}
                            <div>
                                <Input
                                    label="Patient Name *"
                                    value={form.patient_name}
                                    onChange={e => updateField("patient_name", e.target.value)}
                                    placeholder="e.g., John Doe"
                                />
                                {errors.patient_name && (
                                    <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {errors.patient_name}</span>
                                )}
                            </div>

                            {/* Doctor Name */}
                            <Input
                                label="Doctor Name"
                                value={form.doctor_name}
                                onChange={e => updateField("doctor_name", e.target.value)}
                                placeholder="e.g., Dr. Smith (optional)"
                            />

                            {/* ── Medicines section ─────────────────── */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                                        💊 Medicines *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addMedicine}
                                        style={{
                                            background: "#eff6ff",
                                            border: "1.5px dashed #3b82f6",
                                            borderRadius: 8,
                                            padding: "4px 12px",
                                            fontSize: 12,
                                            color: "#3b82f6",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                        }}
                                    >
                                        + Add Medicine
                                    </button>
                                </div>

                                {errors.medicines && (
                                    <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {errors.medicines}</span>
                                )}

                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {form.medicines.map((med, idx) => (
                                        <div key={idx} style={{
                                            background: "#f8fafc",
                                            border: "1.5px solid #e2e8f0",
                                            borderRadius: 12,
                                            padding: "12px 14px",
                                            position: "relative",
                                        }}>
                                            {/* Row index label */}
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
                                                Medicine #{idx + 1}
                                            </div>

                                            {/* Name + Dosage */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                                                <div>
                                                    <Input
                                                        label="Medicine Name *"
                                                        value={med.name}
                                                        onChange={e => updateMedicine(idx, "name", e.target.value)}
                                                        placeholder="e.g., Amoxicillin"
                                                    />
                                                    {errors[`med_${idx}_name`] && (
                                                        <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {errors[`med_${idx}_name`]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <Input
                                                        label="Dosage *"
                                                        value={med.dosage}
                                                        onChange={e => updateMedicine(idx, "dosage", e.target.value)}
                                                        placeholder="e.g., 500mg"
                                                    />
                                                    {errors[`med_${idx}_dosage`] && (
                                                        <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {errors[`med_${idx}_dosage`]}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Frequency + Duration */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                                <Select
                                                    label="Frequency"
                                                    value={med.frequency}
                                                    onChange={e => updateMedicine(idx, "frequency", e.target.value)}
                                                >
                                                    {FREQUENCY_OPTIONS.map(f => <option key={f}>{f}</option>)}
                                                </Select>
                                                <Select
                                                    label="Duration"
                                                    value={med.duration}
                                                    onChange={e => updateMedicine(idx, "duration", e.target.value)}
                                                >
                                                    {DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                                </Select>
                                            </div>

                                            {/* Remove button — only if more than 1 */}
                                            {form.medicines.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedicine(idx)}
                                                    style={{
                                                        position: "absolute",
                                                        top: 10,
                                                        right: 10,
                                                        background: "#fef2f2",
                                                        border: "none",
                                                        borderRadius: 6,
                                                        padding: "2px 8px",
                                                        fontSize: 12,
                                                        color: "#ef4444",
                                                        cursor: "pointer",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    ✕ Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Date Issued */}
                            <div>
                                <Input
                                    label="Date Issued *"
                                    type="date"
                                    value={form.date_issued}
                                    onChange={e => updateField("date_issued", e.target.value)}
                                />
                                {errors.date_issued && (
                                    <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {errors.date_issued}</span>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                    Notes
                                </label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => updateField("notes", e.target.value)}
                                    placeholder="Additional instructions or notes..."
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1.5px solid #e2e8f0",
                                        fontSize: 13,
                                        fontFamily: "inherit",
                                        resize: "vertical",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        color: "#0f172a",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
                            <Btn type="submit">{editId ? "Update" : "Add Prescription"}</Btn>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
