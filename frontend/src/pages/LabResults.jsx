import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast, api } from '../utils/api';
import { Btn, Modal, Input, Select, Table, Card, Badge, Loading, ErrorBox, Toast } from '../components/UI';

export default function LabResults() {
    const { data, loading, error, load } = useApi("lab-results");
    const { toast, show } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ patient_id: "", test_name: "", result_value: "", status: "Pending", date: "" });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, [load]);

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const openAdd = () => {
        setForm({ patient_id: "", test_name: "", result_value: "", status: "Pending", date: new Date().toISOString().slice(0, 10) });
        setEditId(null);
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setForm({
            patient_id:   row.patient_id,
            test_name:    row.test_name,
            result_value: row.result_value,
            status:       row.status,
            date:         row.date,
        });
        setEditId(row._id || row.id);
        setModalOpen(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api("PUT", `lab-results/${editId}`, form);
                show("Lab result updated successfully! 🧪");
            } else {
                await api("POST", "lab-results", form);
                show("Lab result added successfully! 🧪");
            }
            setModalOpen(false);
            load();
        } catch {
            show("Error saving lab result", "err");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this lab result? This action cannot be undone.")) return;
        try {
            await api("DELETE", `lab-results/${id}`);
            show("Lab result deleted 🗑️");
            load();
        } catch {
            show("Error deleting lab result", "err");
        }
    };

    const filtered = data.filter(row =>
        row.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
        row.test_name?.toLowerCase().includes(search.toLowerCase()) ||
        row.result_value?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = useMemo(() => {
        const total = data.length;
        const normal = data.filter(r => r.status === "Normal").length;
        const abnormal = data.filter(r => r.status === "Abnormal").length;
        const pending = data.filter(r => r.status === "Pending").length;
        return { total, normal, abnormal, pending };
    }, [data]);

    const STATUS_COLORS = {
        "Normal": "#10b981",
        "Abnormal": "#ef4444",
        "Pending": "#f59e0b",
    };

    const columns = [
        {
            key: "test_name",
            label: "Test Information",
            render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 40, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        🧪
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{r.test_name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.date}</div>
                    </div>
                </div>
            )
        },
        { key: "patient_id", label: "Patient ID", render: r => <span style={{ fontFamily: "monospace", color: "#475569" }}>{r.patient_id}</span> },
        { key: "result_value", label: "Result", render: r => <span style={{ fontWeight: 600, color: "#334155" }}>{r.result_value}</span> },
        { key: "status", label: "Status", render: r => <Badge label={r.status} color={STATUS_COLORS[r.status] || "#64748b"} /> },
        {
            key: "actions",
            label: "",
            render: r => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => openEdit(r)}>✏️ Edit</Btn>
                    <Btn variant="danger" onClick={() => handleDelete(r.id || r._id)}>🗑️ Delete</Btn>
                </div>
            )
        },
    ];

    return (
        <div>
            <Toast toast={toast} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>🧪 Lab Results</h2>
                    <p style={{ fontSize: 13, color: "#5b6e8c", marginTop: 2 }}>{data.length} total records</p>
                </div>
                <Btn onClick={openAdd}>+ Add Result</Btn>
            </div>
            
            {error && <ErrorBox msg={error} />}
            
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 24 }}>
                <Card style={{ padding: 22, borderTop: "4px solid #3b82f6" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Total Lab Tests</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stats.total}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #10b981" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Normal Results</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", marginTop: 4 }}>{stats.normal}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #ef4444" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Abnormal Results</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#ef4444", marginTop: 4 }}>{stats.abnormal}</div>
                </Card>
                <Card style={{ padding: 22, borderTop: "4px solid #f59e0b" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Pending Tests</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>{stats.pending}</div>
                </Card>
            </div>
            
            <Card>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f5" }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by patient ID or test name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 40, border: "1.5px solid #e9edf2", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                </div>
                {loading ? <Loading /> : <Table cols={columns} rows={filtered} emptyMsg="No results found" />}
            </Card>
            
            {modalOpen && (
                <Modal title={editId ? "✏️ Edit Lab Result" : "🧪 New Lab Result"} onClose={() => setModalOpen(false)}>
                    <form onSubmit={submit}>
                        <div style={{ display: "grid", gap: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <Input label="Patient ID *" required value={form.patient_id} onChange={e => updateField("patient_id", e.target.value)} placeholder="P001" />
                                <Input label="Test Name *" required value={form.test_name} onChange={e => updateField("test_name", e.target.value)} placeholder="Blood Sugar" />
                            </div>
                            <Input label="Result Value *" required value={form.result_value} onChange={e => updateField("result_value", e.target.value)} placeholder="110 mg/dL" />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <Select label="Status" value={form.status} onChange={e => updateField("status", e.target.value)}>
                                    <option>Pending</option>
                                    <option>Normal</option>
                                    <option>Abnormal</option>
                                </Select>
                                <Input label="Date *" type="date" required value={form.date} onChange={e => updateField("date", e.target.value)} />
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
                            <Btn type="submit">{editId ? "Update Result" : "Add Result"}</Btn>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}