// src/pages/Patients.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../utils/api';
import { api } from '../utils/api';
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

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_COLORS = {
    "A+": "#ef4444", "A-": "#dc2626",
    "B+": "#3b82f6", "B-": "#2563eb",
    "AB+": "#8b5cf6", "AB-": "#7c3aed",
    "O+": "#10b981", "O-": "#059669"
};

export default function Patients() {
    const { data, loading, error, load } = useApi("patients");
    const { toast, show } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: "", age: "", gender: "Male", contact: "", address: "", blood_type: "O+" });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        load();
    }, [load]);

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    
    const openAdd = () => {
        setForm({ name: "", age: "", gender: "Male", contact: "", address: "", blood_type: "O+" });
        setEditId(null);
        setModalOpen(true);
    };
    
    const openEdit = (patient) => {
        setForm({
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            contact: patient.contact,
            address: patient.address,
            blood_type: patient.blood_type || "O+"
        });
        setEditId(patient._id);
        setModalOpen(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const body = { ...form, age: parseInt(form.age) };
            if (editId) {
                await api("PUT", `patients/${editId}`, body);
                show("Patient updated successfully!");
            } else {
                await api("POST", "patients", body);
                show("Patient registered successfully!");
            }
            setModalOpen(false);
            load();
        } catch {
            show("Error saving patient", "err");
        }
    };

    const deletePatient = async (id) => {
        if (!window.confirm("Delete this patient? This action cannot be undone.")) return;
        try {
            await api("DELETE", `patients/${id}`);
            show("Patient deleted");
            load();
        } catch {
            show("Error deleting patient", "err");
        }
    };

    const filtered = data.filter(patient =>
        patient.name?.toLowerCase().includes(search.toLowerCase()) ||
        patient.contact?.includes(search)
    );

    const stats = useMemo(() => {
        const total = data.length;
        const male = data.filter(p => p.gender === "Male").length;
        const female = data.filter(p => p.gender === "Female").length;
        return { total, male, female };
    }, [data]);

    const columns = [
        {
            key: "name",
            label: "Patient",
            render: (p) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 40,
                        background: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18
                    }}>
                        {p.gender === "Female" ? "👩" : "👨"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{p._id?.slice(-6)}</div>
                    </div>
                </div>
            )
        },
        { key: "age", label: "Age", render: p => `${p.age} yrs` },
        { key: "gender", label: "Gender" },
        {
            key: "blood_type",
            label: "Blood",
            render: p => p.blood_type ? <Badge label={p.blood_type} color={BLOOD_COLORS[p.blood_type]} /> : "—"
        },
        { key: "contact", label: "Contact" },
        { key: "address", label: "Address", render: p => <span style={{ color: "#475569" }}>{p.address?.slice(0, 30)}</span> },
        {
            key: "actions",
            label: "",
            render: p => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => openEdit(p)}>✏️ Edit</Btn>
                    <Btn variant="danger" onClick={() => deletePatient(p._id)}>🗑️ Delete</Btn>
                </div>
            )
        },
    ];

    return (
        <div>
            <Toast toast={toast} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>👤 Patients</h2>
                    <p style={{ fontSize: 13, color: "#5b6e8c", marginTop: 2 }}>{data.length} total records</p>
                </div>
                <Btn onClick={openAdd}>+ Add Patient</Btn>
            </div>
            
            {error && <ErrorBox msg={error} />}
            
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 24 }}>
                <Card style={{ padding: 22, borderTop: "4px solid #3b82f6" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Total Patients</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stats.total}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #0ea5e9" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Male</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#0ea5e9", marginTop: 4 }}>{stats.male}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #ec4899" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Female</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#ec4899", marginTop: 4 }}>{stats.female}</div>
                </Card>
            </div>
            
            <Card>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f5" }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by name or contact..."
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
                {loading ? <Loading /> : <Table cols={columns} rows={filtered} emptyMsg="No patients found" />}
            </Card>
            
            {modalOpen && (
                <Modal title={editId ? "✏️ Edit Patient" : "👤 New Patient"} onClose={() => setModalOpen(false)}>
                    <form onSubmit={submit}>
                        <div style={{ display: "grid", gap: 14 }}>
                            <Input 
                                label="Full Name *" 
                                required 
                                value={form.name} 
                                onChange={e => updateField("name", e.target.value)} 
                                placeholder="e.g., Kamal Perera"
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <Input 
                                    label="Age *" 
                                    type="number" 
                                    min="0" 
                                    max="150" 
                                    required 
                                    value={form.age} 
                                    onChange={e => updateField("age", e.target.value)} 
                                    placeholder="35"
                                />
                                <Select 
                                    label="Gender" 
                                    value={form.gender} 
                                    onChange={e => updateField("gender", e.target.value)}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </Select>
                            </div>
                            <Input 
                                label="Contact *" 
                                required 
                                value={form.contact} 
                                onChange={e => updateField("contact", e.target.value)} 
                                placeholder="0771234567"
                            />
                            <Select 
                                label="Blood Type" 
                                value={form.blood_type} 
                                onChange={e => updateField("blood_type", e.target.value)}
                            >
                                {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
                            </Select>
                            <Input 
                                label="Address *" 
                                required 
                                value={form.address} 
                                onChange={e => updateField("address", e.target.value)} 
                                placeholder="Colombo, Sri Lanka"
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
                            <Btn type="submit">{editId ? "Update Patient" : "Add Patient"}</Btn>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}