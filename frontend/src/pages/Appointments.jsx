import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000"; // All via API Gateway

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({
        patient_name: "",
        doctor_name: "",
        date: "",
        time: "",
        reason: "",
        status: "Pending",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    // File attachment removed

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = () => {
        axios.get(`${API}/appointments`)
            .then(res => {
                // Support both {appointments: [...]} and [...] for backward compatibility
                const arr = Array.isArray(res.data) ? res.data : res.data.appointments;
                setAppointments(arr);
            })
            .catch(() => setError("Could not connect to API Gateway."));
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const bookAppointment = () => {
        const { patient_name, doctor_name, date, time, reason } = form;
        if (!patient_name || !doctor_name || !date || !time || !reason) {
            setError("Please fill in all fields.");
            return;
        }
        if (editingId) {
            // Update existing
            axios.put(`${API}/appointments/${editingId}`, form)
                .then(() => {
                    setMessage("Appointment updated successfully!");
                    setError("");
                    setForm({ patient_name: "", doctor_name: "", date: "", time: "", reason: "", status: "Pending" });
                    setEditingId(null);
                    fetchAppointments();
                    setTimeout(() => setMessage(""), 3000);
                })
                .catch(() => setError("Failed to update appointment."));
        } else {
            // New
            axios.post(`${API}/appointments`, form)
                .then(() => {
                    setMessage("Appointment booked successfully!");
                    setError("");
                    setForm({ patient_name: "", doctor_name: "", date: "", time: "", reason: "", status: "Pending" });
                    fetchAppointments();
                    setTimeout(() => setMessage(""), 3000);
                })
                .catch(() => setError("Failed to book appointment."));
        }
    };
    // Edit appointment (populate form)
    const editAppointment = (appt) => {
        setForm({
            patient_name: appt.patient_name,
            doctor_name: appt.doctor_name,
            date: appt.date,
            time: appt.time,
            reason: appt.reason,
            status: appt.status,
        });
        setEditingId(appt._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    // File attachment removed
    // Filtered appointments
    const filtered = appointments.filter(a => {
        const q = search.toLowerCase();
        return (
            a.patient_name.toLowerCase().includes(q) ||
            a.doctor_name.toLowerCase().includes(q) ||
            a.date.includes(q) ||
            a.status.toLowerCase().includes(q)
        );
    });

    const deleteAppointment = (id) => {
        if (!window.confirm("Delete this appointment?")) return;
        axios.delete(`${API}/appointments/${id}`)
            .then(() => {
                setMessage("Appointment deleted.");
                fetchAppointments();
                setTimeout(() => setMessage(""), 3000);
            })
            .catch(() => setError("Failed to delete appointment."));
    };

    // Update appointment status
    const updateStatus = (id, newStatus) => {
        axios.put(`${API}/appointments/${id}`, { status: newStatus })
            .then(() => {
                setMessage("Status updated.");
                setError("");
                fetchAppointments();
                setTimeout(() => setMessage(""), 3000);
            })
            .catch(() => setError("Failed to update status."));
    };

    const getBadge = (status) => {
        const colors = {
            Pending: { bg: "#fefcbf", color: "#b7791f" },
            Confirmed: { bg: "#c6f6d5", color: "#276749" },
            Cancelled: { bg: "#fed7d7", color: "#9b2c2c" },
        };
        const style = colors[status] || colors.Pending;
        return (
            <span style={{
                background: style.bg, color: style.color,
                padding: "3px 10px", borderRadius: "20px",
                fontSize: "0.75rem", fontWeight: 600
            }}>{status}</span>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', padding: '0 0 60px 0' }}>
            <div style={{ maxWidth: 950, margin: '40px auto', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <h2 style={{ color: '#3730a3', fontWeight: 800, fontSize: 32, letterSpacing: 1, margin: 0 }}>🗓️ Appointments</h2>
                </div>

                {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: 10, marginBottom: 18, fontWeight: 600, boxShadow: '0 2px 8px #0001' }}>{message}</div>}
                {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 20px', borderRadius: 10, marginBottom: 18, fontWeight: 600, boxShadow: '0 2px 8px #0001' }}>{error}</div>}

                {/* Search/filter */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by patient, doctor, date, status..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '10px 18px', border: '1.5px solid #c7d2fe', borderRadius: 10, fontSize: '1rem', width: 340, background: '#f1f5f9', outline: 'none', boxShadow: '0 1px 4px #0001' }}
                    />
                </div>

                {/* Form */}
                <div style={{ background: 'white', borderRadius: 18, padding: 32, marginBottom: 36, boxShadow: '0 4px 24px 0 #6366f133' }}>
                    <h3 style={{ color: '#3730a3', marginBottom: 20, fontWeight: 700, fontSize: 20 }}>📋 {editingId ? 'Edit Appointment' : 'Book New Appointment'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        {[
                            { name: 'patient_name', placeholder: 'Patient Name' },
                            { name: 'doctor_name', placeholder: 'Doctor Name' },
                            { name: 'date', placeholder: 'Date', type: 'date' },
                            { name: 'time', placeholder: 'Time', type: 'time' },
                        ].map(field => (
                            <input
                                key={field.name}
                                name={field.name}
                                type={field.type || 'text'}
                                placeholder={field.placeholder}
                                value={form[field.name]}
                                onChange={handleChange}
                                style={{ padding: '12px 16px', border: '1.5px solid #c7d2fe', borderRadius: 10, fontSize: '1rem', background: '#f8fafc', outline: 'none', boxShadow: '0 1px 4px #0001' }}
                            />
                        ))}
                        <input
                            name="reason"
                            placeholder="Reason for visit"
                            value={form.reason}
                            onChange={handleChange}
                            style={{ gridColumn: '1 / -1', padding: '12px 16px', border: '1.5px solid #c7d2fe', borderRadius: 10, fontSize: '1rem', background: '#f8fafc', outline: 'none', boxShadow: '0 1px 4px #0001' }}
                        />
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            style={{ gridColumn: '1 / -1', padding: '12px 16px', border: '1.5px solid #c7d2fe', borderRadius: 10, fontSize: '1rem', background: '#f8fafc', outline: 'none', boxShadow: '0 1px 4px #0001' }}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                        <button
                            onClick={bookAppointment}
                            style={{ background: editingId ? '#f59e0b' : '#6366f1', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #0001', transition: 'background 0.2s' }}
                        >
                            {editingId ? '✏️ Update Appointment' : '➕ Book Appointment'}
                        </button>
                        {editingId && (
                            <button
                                onClick={() => { setEditingId(null); setForm({ patient_name: '', doctor_name: '', date: '', time: '', reason: '', status: 'Pending' }); }}
                                style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}
                            >Cancel Edit</button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px 0 #6366f133', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 800 }}>
                        <thead style={{ background: '#6366f1', position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                {["Patient", "Doctor", "Date", "Time", "Reason", "Status", "Action"].map(h => (
                                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#6366f1', border: 0 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#a0aec0', fontSize: 18 }}>No appointments found.</td></tr>
                            ) : filtered.map((a, idx) => (
                                <tr key={a._id} style={{ borderTop: '1px solid #e0e7ff', background: idx % 2 === 0 ? '#f8fafc' : 'white', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '14px 18px', fontWeight: 500 }}>{a.patient_name}</td>
                                    <td style={{ padding: '14px 18px', fontWeight: 500 }}>{a.doctor_name}</td>
                                    <td style={{ padding: '14px 18px' }}>{a.date}</td>
                                    <td style={{ padding: '14px 18px' }}>{a.time}</td>
                                    <td style={{ padding: '14px 18px' }}>{a.reason}</td>
                                    <td style={{ padding: '14px 18px' }}>{getBadge(a.status)}</td>
                                    <td style={{ padding: '14px 18px', display: 'flex', gap: 8 }}>
                                        <select
                                            value={a.status}
                                            onChange={e => updateStatus(a._id, e.target.value)}
                                            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #c7d2fe', fontSize: '0.9rem', background: '#f1f5f9', outline: 'none', fontWeight: 600 }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <button
                                            onClick={() => editAppointment(a)}
                                            style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => deleteAppointment(a._id)}
                                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}
                                        >
                                            🗑 Delete
                                        </button>
                                    </td>
                                    {/* File attachment removed */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}