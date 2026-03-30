import React, { useState, useEffect } from "react";
import axios from "axios";

const GATEWAY = "http://localhost:8000";
const API = `${GATEWAY}/doctors`;

const emptyForm = {
  name: "",
  specialization: "",
  contact: "",
  email: "",
  experience: "",
  availability: "",
};

export default function Doctor() {
  const [doctors, setDoctors]     = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState(null);
  const [search, setSearch]       = useState("");
  const [message, setMessage]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [viewDoctor, setViewDoctor] = useState(null);

  // ── Fetch all doctors ──
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}`);
      setDoctors(res.data.data);
    } catch (err) {
      showMessage("Failed to fetch doctors", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  // ── Show message ──
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // ── Handle form input ──
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Submit (Add or Update) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // UPDATE
        await axios.put(`${API}/${editId}`, form);
        showMessage("Doctor updated successfully ✅");
        setEditId(null);
      } else {
        // CREATE
        await axios.post(`${API}`, form);
        showMessage("Doctor added successfully ✅");
      }
      setForm(emptyForm);
      fetchDoctors();
    } catch (err) {
      showMessage(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  // ── Edit ──
  const handleEdit = (doctor) => {
    setEditId(doctor.id);
    setForm({
      name:           doctor.name,
      specialization: doctor.specialization,
      contact:        doctor.contact,
      email:          doctor.email,
      experience:     doctor.experience,
      availability:   doctor.availability,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      showMessage("Doctor deleted successfully 🗑️");
      fetchDoctors();
    } catch {
      showMessage("Failed to delete doctor", "error");
    }
  };

  // ── View single ──
  const handleView = async (id) => {
    try {
      const res = await axios.get(`${API}/${id}`);
      setViewDoctor(res.data.data);
    } catch {
      showMessage("Failed to fetch doctor details", "error");
    }
  };

  // ── Search ──
  const handleSearch = async () => {
    if (!search.trim()) { fetchDoctors(); return; }
    try {
      const res = await axios.get(`${API}/search/${search}`);
      setDoctors(res.data.data);
    } catch {
      showMessage("Search failed", "error");
    }
  };

  // ── Cancel edit ──
  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>🩺 Doctor Management</h1>

      {/* Message */}
      {message && (
        <div style={{ ...s.alert, background: message.type === "error" ? "#fed7d7" : "#c6f6d5", color: message.type === "error" ? "#c53030" : "#276749" }}>
          {message.text}
        </div>
      )}

      {/* ── FORM ── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>{editId ? "✏️ Edit Doctor" : "➕ Add New Doctor"}</h2>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.grid}>
            <div style={s.field}>
              <label style={s.label}>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Dr. John Silva" style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Specialization *</label>
              <input name="specialization" value={form.specialization} onChange={handleChange}
                placeholder="Cardiology" style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Contact *</label>
              <input name="contact" value={form.contact} onChange={handleChange}
                placeholder="0771234567" style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email *</label>
              <input name="email" value={form.email} onChange={handleChange}
                placeholder="doctor@hospital.com" style={s.input} type="email" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Experience (years) *</label>
              <input name="experience" value={form.experience} onChange={handleChange}
                placeholder="5" style={s.input} type="number" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Availability *</label>
              <input name="availability" value={form.availability} onChange={handleChange}
                placeholder="Mon-Fri" style={s.input} required />
            </div>
          </div>
          <div style={s.btnRow}>
            <button type="submit" style={s.btnGreen}>
              {editId ? "Update Doctor" : "Add Doctor"}
            </button>
            {editId && (
              <button type="button" onClick={handleCancel} style={s.btnGray}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── SEARCH ── */}
      <div style={s.searchRow}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by specialization..."
          style={{ ...s.input, flex: 1 }}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} style={s.btnBlue}>Search</button>
        <button onClick={() => { setSearch(""); fetchDoctors(); }} style={s.btnGray}>Reset</button>
      </div>

      {/* ── TABLE ── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>👨‍⚕️ All Doctors ({doctors.length})</h2>
        {loading ? (
          <p style={{ textAlign: "center", color: "#718096" }}>Loading...</p>
        ) : doctors.length === 0 ? (
          <p style={{ textAlign: "center", color: "#718096" }}>No doctors found.</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Specialization</th>
                  <th style={s.th}>Contact</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Exp.</th>
                  <th style={s.th}>Availability</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d, i) => (
                  <tr key={d.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                    <td style={s.td}>{i + 1}</td>
                    <td style={s.td}>{d.name}</td>
                    <td style={s.td}>
                      <span style={s.badge}>{d.specialization}</span>
                    </td>
                    <td style={s.td}>{d.contact}</td>
                    <td style={s.td}>{d.email}</td>
                    <td style={s.td}>{d.experience} yrs</td>
                    <td style={s.td}>{d.availability}</td>
                    <td style={s.td}>
                      <div style={s.actionRow}>
                        <button onClick={() => handleView(d.id)} style={s.btnSm("#3182ce")}>View</button>
                        <button onClick={() => handleEdit(d)}    style={s.btnSm("#d69e2e")}>Edit</button>
                        <button onClick={() => handleDelete(d.id)} style={s.btnSm("#e53e3e")}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── VIEW MODAL ── */}
      {viewDoctor && (
        <div style={s.overlay} onClick={() => setViewDoctor(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.cardTitle}>👨‍⚕️ Doctor Details</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(viewDoctor).filter(([k]) => k !== "id").map(([k, v]) => (
                  <tr key={k}>
                    <td style={s.modalKey}>{k.replace("_", " ").toUpperCase()}</td>
                    <td style={s.modalVal}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setViewDoctor(null)} style={{ ...s.btnGray, marginTop: 16, width: "100%" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──
const s = {
  page:      { maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "Segoe UI, Arial, sans-serif", background: "#f7fafc", minHeight: "100vh" },
  title:     { textAlign: "center", color: "#1a365d", fontSize: 30, marginBottom: 20 },
  alert:     { padding: "12px 20px", borderRadius: 8, marginBottom: 16, fontWeight: "bold", textAlign: "center" },
  card:      { background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 20 },
  cardTitle: { color: "#2d3748", fontSize: 18, marginBottom: 16, borderBottom: "2px solid #ebf8ff", paddingBottom: 8 },
  form:      { display: "flex", flexDirection: "column", gap: 16 },
  grid:      { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  field:     { display: "flex", flexDirection: "column", gap: 4 },
  label:     { fontSize: 13, fontWeight: "600", color: "#4a5568" },
  input:     { padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e0", fontSize: 14, outline: "none" },
  btnRow:    { display: "flex", gap: 10 },
  btnGreen:  { padding: "10px 24px", background: "#38a169", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14 },
  btnGray:   { padding: "10px 24px", background: "#718096", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14 },
  btnBlue:   { padding: "10px 20px", background: "#3182ce", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  searchRow: { display: "flex", gap: 10, marginBottom: 20, alignItems: "center" },
  tableWrap: { overflowX: "auto" },
  table:     { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  thead:     { background: "#ebf8ff" },
  th:        { padding: "12px 14px", textAlign: "left", color: "#2b6cb0", fontWeight: "700", whiteSpace: "nowrap" },
  td:        { padding: "11px 14px", color: "#4a5568" },
  rowEven:   { background: "#ffffff" },
  rowOdd:    { background: "#f7fafc" },
  badge:     { background: "#bee3f8", color: "#2b6cb0", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold" },
  actionRow: { display: "flex", gap: 6 },
  btnSm:     (bg) => ({ padding: "5px 12px", background: bg, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold" }),
  overlay:   { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:     { background: "white", borderRadius: 12, padding: 28, width: 420, maxWidth: "90%" },
  modalKey:  { padding: "8px 12px", fontWeight: "bold", color: "#4a5568", fontSize: 13, background: "#f7fafc", width: "40%" },
  modalVal:  { padding: "8px 12px", color: "#2d3748", fontSize: 13 },
};
