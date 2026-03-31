import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast, api } from '../utils/api';
import { Btn, Modal, Input, Table, Card, Badge, Loading, ErrorBox, Toast } from '../components/UI';

export default function Doctors() {
    const { data, loading, error, load } = useApi("doctors");
    const { toast, show } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: "", specialization: "", contact: "", email: "", experience: "", availability: "" });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, [load]);

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const openAdd = () => {
        setForm({ name: "", specialization: "", contact: "", email: "", experience: "", availability: "" });
        setEditId(null);
        setModalOpen(true);
    };

    const openEdit = (doctor) => {
        setForm({
            name: doctor.name,
            specialization: doctor.specialization,
            contact: doctor.contact,
            email: doctor.email,
            experience: doctor.experience,
            availability: doctor.availability,
        });
        setEditId(doctor.id || doctor._id);
        setModalOpen(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const body = { ...form, experience: parseInt(form.experience) || 0 };
            if (editId) {
                await api("PUT", `doctors/${editId}`, body);
                show("Doctor updated successfully! 🩺");
            } else {
                await api("POST", "doctors", body);
                show("Doctor added successfully! 🩺");
            }
            setModalOpen(false);
            load();
        } catch {
            show("Error saving doctor", "err");
        }
    };

    const deleteDoctor = async (id) => {
        if (!window.confirm("Delete this doctor? This action cannot be undone.")) return;
        try {
            await api("DELETE", `doctors/${id}`);
            show("Doctor deleted 🗑️");
            load();
        } catch {
            show("Error deleting doctor", "err");
        }
    };

    const filtered = data.filter(doc =>
        doc.name?.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = useMemo(() => {
        const total = data.length;
        const specialties = new Set(data.map(d => d.specialization)).size;
        const active = data.filter(d => d.availability && !d.availability.toLowerCase().includes('unavailable')).length;
        return { total, specialties, active };
    }, [data]);

    const columns = [
        {
            key: "name",
            label: "Doctor",
            render: (d) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 40, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        👨‍⚕️
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{d.id?.slice(-6) || d._id?.slice(-6)}</div>
                    </div>
                </div>
            )
        },
        { key: "specialization", label: "Specialization", render: d => <Badge label={d.specialization} color="#3b82f6" /> },
        { key: "experience", label: "Experience", render: d => `${d.experience} yrs` },
        { key: "contact", label: "Contact", render: d => d.contact },
        { key: "email", label: "Email", render: d => <span style={{ color: "#475569" }}>{d.email}</span> },
        { key: "availability", label: "Availability", render: d => <span style={{ fontWeight: 500 }}>{d.availability}</span> },
        {
            key: "actions",
            label: "",
            render: d => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => openEdit(d)}>✏️ Edit</Btn>
                    <Btn variant="danger" onClick={() => deleteDoctor(d.id || d._id)}>🗑️ Delete</Btn>
                </div>
            )
        },
    ];

    return (
        <div>
            <Toast toast={toast} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>🩺 Doctors</h2>
                    <p style={{ fontSize: 13, color: "#5b6e8c", marginTop: 2 }}>{data.length} total records</p>
                </div>
                <Btn onClick={openAdd}>+ Add Doctor</Btn>
            </div>
            
            {error && <ErrorBox msg={error} />}
            
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 24 }}>
                <Card style={{ padding: 22, borderTop: "4px solid #3b82f6" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Total Doctors</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stats.total}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #8b5cf6" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Specialties</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#8b5cf6", marginTop: 4 }}>{stats.specialties}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #10b981" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Active / Available</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", marginTop: 4 }}>{stats.active}</div>
                </Card>
            </div>
            
            <Card>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f5" }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by name or specialization..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 40, border: "1.5px solid #e9edf2", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                </div>
                {loading ? <Loading /> : <Table cols={columns} rows={filtered} emptyMsg="No doctors found" />}
            </Card>
            
            {modalOpen && (
                <Modal title={editId ? "✏️ Edit Doctor" : "🩺 New Doctor"} onClose={() => setModalOpen(false)}>
                    <form onSubmit={submit}>
                        <div style={{ display: "grid", gap: 14 }}>
                            <Input label="Full Name *" required value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Dr. John Silva" />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <Input label="Specialization *" required value={form.specialization} onChange={e => updateField("specialization", e.target.value)} placeholder="Cardiology" />
                                <Input label="Experience (Yrs) *" type="number" min="0" required value={form.experience} onChange={e => updateField("experience", e.target.value)} placeholder="5" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <Input label="Contact *" required value={form.contact} onChange={e => updateField("contact", e.target.value)} placeholder="0771234567" />
                                <Input label="Email *" type="email" required value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="doctor@hospital.com" />
                            </div>
                            <Input label="Availability *" required value={form.availability} onChange={e => updateField("availability", e.target.value)} placeholder="Mon-Fri, 9AM-5PM" />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
                            <Btn type="submit">{editId ? "Update Doctor" : "Add Doctor"}</Btn>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
