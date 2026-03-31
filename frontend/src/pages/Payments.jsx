import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast, api } from '../utils/api';
import { Btn, Input, Select, Table, Card, Badge, Loading, ErrorBox, Toast } from '../components/UI';

const STATUS_COLORS = {
    "completed": "#10b981",
    "failed": "#ef4444",
    "pending": "#f59e0b",
};

const METHOD_COLORS = {
    "cash": "#3b82f6",
    "card": "#8b5cf6",
    "online": "#0ea5e9"
};

export default function Payments() {
    const { data, loading, error, load } = useApi("payments");
    const { toast, show } = useToast();
    
    // Split pane form state
    const [form, setForm] = useState({ patient_id: "", amount: "", method: "cash", status: "pending" });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, [load]);

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setForm({ patient_id: "", amount: "", method: "cash", status: "pending" });
        setEditId(null);
    };

    const handleEdit = (p) => {
        setForm({
            patient_id: p.patient_id || "",
            amount: p.amount || "",
            method: p.method || "cash",
            status: p.status || "pending",
        });
        setEditId(p.id || p._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const body = { ...form, amount: parseFloat(form.amount) };
            if (editId) {
                await api("PUT", `payments/${editId}`, body);
                show("Payment updated successfully! 💰");
            } else {
                await api("POST", "payments", body);
                show("Payment processed successfully! 💰");
            }
            resetForm();
            load();
        } catch {
            show("Error saving payment", "err");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this payment? This action cannot be undone.")) return;
        try {
            await api("DELETE", `payments/${id}`);
            show("Payment deleted 🗑️");
            load();
        } catch {
            show("Error deleting payment", "err");
        }
    };

    const filtered = data.filter(p => {
        const term = search.toLowerCase();
        return (
            p.patient_id?.toLowerCase().includes(term) ||
            p.method?.toLowerCase().includes(term) ||
            p.status?.toLowerCase().includes(term) ||
            (p.id || p._id)?.toLowerCase().includes(term)
        );
    });

    // Stats
    const stats = useMemo(() => {
        const total = data.length;
        const completed = data.filter(p => p.status === "completed").length;
        const pending = data.filter(p => p.status === "pending").length;
        const failed = data.filter(p => p.status === "failed").length;
        const totalAmount = data.reduce((sum, p) => p.status !== "failed" ? sum + Number(p.amount || 0) : sum, 0);
        return { total, completed, pending, failed, totalAmount };
    }, [data]);

    const columns = [
        {
            key: "patient_id",
            label: "Transaction Details",
            render: (p) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 40, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {p.method === "cash" ? "💵" : p.method === "card" ? "💳" : "🌐"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{p.patient_id}</div>
                        <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{p.id || p._id}</div>
                    </div>
                </div>
            )
        },
        { key: "amount", label: "Amount", render: p => <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.05rem" }}>Rs. {Number(p.amount).toLocaleString()}</span> },
        { key: "method", label: "Method", render: p => <Badge label={p.method.toUpperCase()} color={METHOD_COLORS[p.method] || "#64748b"} /> },
        { key: "status", label: "Status", render: p => <Badge label={p.status.toUpperCase()} color={STATUS_COLORS[p.status] || "#64748b"} /> },
        {
            key: "actions",
            label: "",
            render: p => (
                <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => handleEdit(p)}>✏️ Edit</Btn>
                    <Btn variant="danger" onClick={() => handleDelete(p.id || p._id)}>🗑️ Delete</Btn>
                </div>
            )
        },
    ];

    return (
        <div>
            <Toast toast={toast} />
            
            {/* Hero Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 16px 40px rgba(31,41,55,0.06)", borderRadius: "28px", padding: "28px" }}>
                <div>
                    <div style={{ display: "inline-block", padding: "8px 14px", borderRadius: "999px", background: "linear-gradient(90deg, #2563eb, #06b6d4)", color: "#fff", fontWeight: 700, fontSize: "12px", letterSpacing: "0.4px", marginBottom: "14px" }}>💸 PAYMENT DASHBOARD</div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: "#0f172a" }}>Process & Manage</h1>
                    <p style={{ marginTop: 8, color: "#64748b", opacity: 0.9 }}>Seamless transaction management with detailed financial ledgers.</p>
                </div>
                <div>
                    <Btn onClick={() => { load(); show("Data Refreshed", "ok"); }} style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}>🔄 Refresh Data</Btn>
                </div>
            </div>

            {error && <ErrorBox msg={error} />}

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 24 }}>
                <Card style={{ padding: 22 }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Total Payments</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stats.total}</div>
                </Card>
                <Card style={{ padding: 22 }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Completed</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", marginTop: 4 }}>{stats.completed}</div>
                </Card>
                <Card style={{ padding: 22 }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Pending</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>{stats.pending}</div>
                </Card>
                <Card style={{ padding: 22 }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Failed</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#ef4444", marginTop: 4 }}>{stats.failed}</div>
                </Card>
                <Card style={{ padding: 22, gridColumn: "span 2", background: "linear-gradient(135deg, #f8fafc, #ffffff)", borderLeft: "4px solid #3b82f6" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Total Value</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#1d4ed8", marginTop: 4 }}>Rs. {stats.totalAmount.toLocaleString()}</div>
                </Card>
            </div>

            {/* Split Content: Form (Left) & Table (Right) */}
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
                
                {/* Form Card */}
                <Card style={{ position: "sticky", top: 20 }}>
                    <div style={{ marginBottom: 20, padding: 24, paddingBottom: 0 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                            {editId ? "✏️ Update Payment" : "💳 Process Payment"}
                        </h2>
                        {editId && <span style={{ display: "inline-block", background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, marginTop: 8 }}>Editing Mode</span>}
                    </div>

                    <form onSubmit={submit} style={{ display: "grid", gap: 16, padding: "0 24px 24px" }}>
                        <Input 
                            label="Patient ID *" 
                            required 
                            value={form.patient_id} 
                            onChange={e => updateField("patient_id", e.target.value)} 
                            placeholder="e.g. P123" 
                        />
                        <Input 
                            label="Amount (Rs.) *" 
                            type="number" 
                            step="0.01" 
                            required 
                            value={form.amount} 
                            onChange={e => updateField("amount", e.target.value)} 
                            placeholder="1500" 
                        />
                        <Select 
                            label="Payment Method" 
                            value={form.method} 
                            onChange={e => updateField("method", e.target.value)}
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="online">Online</option>
                        </Select>
                        <Select 
                            label="Status" 
                            value={form.status} 
                            onChange={e => updateField("status", e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </Select>

                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                            <Btn type="submit" style={{ flex: 1, padding: "12px" }}>
                                {editId ? "Update" : "Process"}
                            </Btn>
                            {editId && (
                                <Btn type="button" variant="ghost" onClick={resetForm}>
                                    Cancel
                                </Btn>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Table Card */}
                <Card style={{ overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f2f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>Transaction Ledger</h2>
                        </div>
                        <input
                            type="text"
                            placeholder="🔍 Search transactions..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ padding: "10px 14px", borderRadius: 40, border: "1.5px solid #e9edf2", fontSize: 13, outline: "none", width: 260, fontFamily: "inherit", background: "#f8fbff" }}
                        />
                    </div>

                    {loading ? <Loading /> : <Table cols={columns} rows={filtered} emptyMsg="No transactions found" />}
                </Card>

            </div>
        </div>
    );
}



