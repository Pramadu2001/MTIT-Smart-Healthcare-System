import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast, api } from '../utils/api';
import { Btn, Modal, Input, Select, Table, Card, Badge, Loading, ErrorBox, Toast } from '../components/UI';

const STATUS_COLORS = {
    "Pending": "#f59e0b",
    "Confirmed": "#10b981",
    "Cancelled": "#ef4444"
};

export default function Appointments() {
    const { data, loading, error, load } = useApi("appointments");
    const { toast, show } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ patient_name: "", doctor_name: "", date: "", time: "", reason: "", status: "Pending" });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, [load]);

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const openAdd = () => {
        setForm({ patient_name: "", doctor_name: "", date: "", time: "", reason: "", status: "Pending" });
        setEditId(null);
        setModalOpen(true);
    };

    const openEdit = (appt) => {
        setForm({
            patient_name: appt.patient_name,
            doctor_name: appt.doctor_name,
            date: appt.date,
            time: appt.time,
            reason: appt.reason,
            status: appt.status,
        });
        setEditId(appt.id || appt._id);
        setModalOpen(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api("PUT", `appointments/${editId}`, form);
                show("Appointment updated! 🗓️");
            } else {
                await api("POST", "appointments", form);
                show("Appointment booked! 🗓️");
            }
            setModalOpen(false);
            load();
        } catch {
            show("Error saving appointment", "err");
        }
    };

    const deleteAppointment = async (id) => {
        if (!window.confirm("Delete this appointment? This action cannot be undone.")) return;
        try {
            await api("DELETE", `appointments/${id}`);
            show("Appointment deleted 🗑️");
            load();
        } catch {
            show("Error deleting appointment", "err");
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api("PUT", `appointments/${id}`, { status: newStatus });
            show(`Status updated to ${newStatus}`);
            load();
        } catch {
            show("Error updating status", "err");
        }
    };

    const filtered = data.filter(a =>
        a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.date?.includes(search)
    );

    const stats = useMemo(() => {
        const total = data.length;
        const confirmed = data.filter(a => a.status === "Confirmed").length;
        const pending = data.filter(a => a.status === "Pending").length;
        const cancelled = data.filter(a => a.status === "Cancelled").length;
        return { total, confirmed, pending, cancelled };
    }, [data]);

    const columns = [
        {
            key: "patient_name",
            label: "Patient",
            render: (a) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 38, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                    <span style={{ fontWeight: 600 }}>{a.patient_name}</span>
                </div>
            )
        },
        { key: "doctor_name", label: "Doctor", render: a => <span style={{ color: "#475569", fontWeight: 500 }}>🩺 {a.doctor_name}</span> },
        { key: "datetime", label: "Schedule", render: a => (
            <div>
                <div style={{ fontWeight: 500 }}>{a.date}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{a.time}</div>
            </div>
        )},
        { key: "reason", label: "Reason", render: a => <span style={{ color: "#64748b" }}>{a.reason}</span> },
        { key: "status", label: "Status", render: a => (
             <select
                value={a.status}
                onChange={e => updateStatus(a.id || a._id, e.target.value)}
                style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${STATUS_COLORS[a.status] || '#cbd5e1'}`, fontSize: "0.75rem", background: `${STATUS_COLORS[a.status] || '#cbd5e1'}15`, color: STATUS_COLORS[a.status] || '#475569', outline: "none", fontWeight: 600, cursor: "pointer" }}
            >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        )},
        {
            key: "actions",
            label: "",
            render: a => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => openEdit(a)}>✏️ Edit</Btn>
                    <Btn variant="danger" onClick={() => deleteAppointment(a.id || a._id)}>🗑️ Delete</Btn>
                </div>
            )
        },
    ];

    return (
        <div>
            <Toast toast={toast} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>🗓️ Appointments</h2>
                    <p style={{ fontSize: 13, color: "#5b6e8c", marginTop: 2 }}>{data.length} total records</p>
                </div>
                <Btn onClick={openAdd}>+ Book Appointment</Btn>
            </div>
            
            {error && <ErrorBox msg={error} />}
            
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 24 }}>
                <Card style={{ padding: 22, borderTop: "4px solid #3b82f6" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Total Appointments</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stats.total}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #10b981" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Confirmed</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", marginTop: 4 }}>{stats.confirmed}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #f59e0b" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Pending</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>{stats.pending}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #ef4444" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Cancelled</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#ef4444", marginTop: 4 }}>{stats.cancelled}</div>
                </Card>
            </div>
            
            <Card>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f5" }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by patient, doctor, or date..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 40, border: "1.5px solid #e9edf2", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                </div>
                {loading ? <Loading /> : <Table cols={columns} rows={filtered} emptyMsg="No appointments found" />}
            </Card>
            
            {modalOpen && (
                <Modal title={editId ? "✏️ Edit Appointment" : "🗓️ Book Appointment"} onClose={() => setModalOpen(false)}>
                    <form onSubmit={submit}>
                        <div style={{ display: "grid", gap: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <Input label="Patient Name *" required value={form.patient_name} onChange={e => updateField("patient_name", e.target.value)} placeholder="John Doe" />
                                <Input label="Doctor Name *" required value={form.doctor_name} onChange={e => updateField("doctor_name", e.target.value)} placeholder="Dr. Smith" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <Input label="Date *" type="date" required value={form.date} onChange={e => updateField("date", e.target.value)} />
                                <Input label="Time *" type="time" required value={form.time} onChange={e => updateField("time", e.target.value)} />
                            </div>
                            <Input label="Reason *" required value={form.reason} onChange={e => updateField("reason", e.target.value)} placeholder="Fever and checkup" />
                            <Select label="Status" value={form.status} onChange={e => updateField("status", e.target.value)}>
                                <option>Pending</option>
                                <option>Confirmed</option>
                                <option>Cancelled</option>
                            </Select>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
                            <Btn type="submit">{editId ? "Update" : "Book"}</Btn>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
