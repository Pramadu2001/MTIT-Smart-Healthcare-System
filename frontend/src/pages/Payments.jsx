import React, { useEffect, useMemo, useState } from "react";

export default function Payments() {
  const API_BASE = "http://localhost:8006";

  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    patient_id: "",
    amount: "",
    method: "cash",
    status: "pending",
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/payments`);
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (error) {
      setMessage("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const term = search.toLowerCase();
      return (
        String(p._id || "").toLowerCase().includes(term) ||
        String(p.patient_id || "").toLowerCase().includes(term) ||
        String(p.method || "").toLowerCase().includes(term) ||
        String(p.status || "").toLowerCase().includes(term)
      );
    });
  }, [payments, search]);

  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter((p) => p.status === "completed").length;
    const pending = payments.filter((p) => p.status === "pending").length;
    const failed = payments.filter((p) => p.status === "failed").length;
    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    return { total, completed, pending, failed, totalAmount };
  }, [payments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      patient_id: "",
      amount: "",
      method: "cash",
      status: "pending",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE}/payments/${editingId}`
        : `${API_BASE}/payments`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: formData.patient_id,
          amount: Number(formData.amount),
          method: formData.method,
          status: formData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      setMessage(editingId ? "Payment updated successfully" : "Payment added successfully");
      resetForm();
      fetchPayments();
    } catch (error) {
      setMessage("Server error");
    }
  };

  const handleEdit = (payment) => {
    setEditingId(payment._id);
    setFormData({
      patient_id: payment.patient_id || "",
      amount: payment.amount || "",
      method: payment.method || "cash",
      status: payment.status || "pending",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this payment?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/payments/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Delete failed");
        return;
      }

      setMessage("Payment deleted successfully");
      fetchPayments();
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgCircleOne}></div>
      <div style={styles.bgCircleTwo}></div>

      <div style={styles.container}>
        <div style={styles.heroCard}>
          <div>
            <div style={styles.heroBadge}>Healthcare Payment Service</div>
            <h1 style={styles.title}>Payment Dashboard</h1>
            <p style={styles.subtitle}>
              Manage patient payments with a clean, modern interface.
            </p>
          </div>
          <div style={styles.heroRight}>
            <button onClick={fetchPayments} style={styles.refreshBtn}>
              Refresh Data
            </button>
          </div>
        </div>

        {message && <div style={styles.messageBox}>{message}</div>}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Payments</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Completed</div>
            <div style={{ ...styles.statValue, color: "#15803d" }}>
              {stats.completed}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending</div>
            <div style={{ ...styles.statValue, color: "#b45309" }}>
              {stats.pending}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Failed</div>
            <div style={{ ...styles.statValue, color: "#b91c1c" }}>
              {stats.failed}
            </div>
          </div>
          <div style={{ ...styles.statCard, gridColumn: "span 2" }}>
            <div style={styles.statLabel}>Total Amount</div>
            <div style={{ ...styles.statValue, color: "#1d4ed8" }}>
              Rs. {stats.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.formCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                {editingId ? "Update Payment" : "Add New Payment"}
              </h2>
              {editingId && (
                <span style={styles.editingBadge}>Editing Mode</span>
              )}
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Patient ID</label>
                <input
                  name="patient_id"
                  placeholder="Enter patient ID"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Amount</label>
                <input
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Payment Method</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div style={styles.buttonRow}>
                <button type="submit" style={styles.primaryBtn}>
                  {editingId ? "Update Payment" : "Add Payment"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.secondaryBtn}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableTopBar}>
              <div>
                <h2 style={styles.sectionTitle}>Payment Records</h2>
                <p style={styles.tableSubtext}>
                  Search and manage your payment records.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search by patient, status, method..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {loading ? (
              <div style={styles.emptyState}>Loading payments...</div>
            ) : filteredPayments.length === 0 ? (
              <div style={styles.emptyState}>No payments found.</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Method</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.patientCell}>
                            <div style={styles.avatar}>
                              {String(payment.patient_id || "?")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.patientId}>
                                {payment.patient_id}
                              </div>
                              <div style={styles.smallText}>Patient Record</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.amountText}>
                            Rs. {Number(payment.amount || 0).toLocaleString()}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.methodBadge}>
                            {payment.method}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={getStatusStyle(payment.status)}>
                            {payment.status}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.idText}>{payment._id}</span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actionRow}>
                            <button
                              onClick={() => handleEdit(payment)}
                              style={styles.editBtn}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(payment._id)}
                              style={styles.deleteBtn}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, rgb(238,244,255) 0%, rgb(248,250,255) 45%, rgb(240,255,252) 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "32px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  bgCircleOne: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.12)",
    top: "-80px",
    right: "-80px",
    filter: "blur(10px)",
  },

  bgCircleTwo: {
    position: "absolute",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "rgba(16,185,129,0.10)",
    bottom: "-60px",
    left: "-60px",
    filter: "blur(10px)",
  },

  container: {
    maxWidth: "1320px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  heroCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 16px 40px rgba(31,41,55,0.10)",
    borderRadius: "28px",
    padding: "28px",
    marginBottom: "24px",
  },

  heroBadge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #2563eb, #06b6d4)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "12px",
    letterSpacing: "0.4px",
    marginBottom: "14px",
  },

  title: {
    fontSize: "42px",
    lineHeight: 1.1,
    color: "#0f172a",
    margin: 0,
    fontWeight: 800,
  },

  subtitle: {
    marginTop: "10px",
    fontSize: "16px",
    color: "#64748b",
    maxWidth: "650px",
  },

  heroRight: {
    display: "flex",
    alignItems: "center",
  },

  refreshBtn: {
    border: "none",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(16,185,129,0.22)",
  },

  messageBox: {
    marginBottom: "20px",
    background: "linear-gradient(135deg, #eff6ff, #ecfeff)",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "14px 18px",
    borderRadius: "16px",
    fontWeight: 600,
    boxShadow: "0 8px 20px rgba(59,130,246,0.08)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },

  statCard: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.55)",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 14px 30px rgba(15,23,42,0.07)",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "10px",
    fontWeight: 600,
  },

  statValue: {
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: 800,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "24px",
    alignItems: "start",
  },

  formCard: {
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
    position: "sticky",
    top: "20px",
  },

  tableCard: {
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: 800,
  },

  editingBadge: {
    background: "#fef3c7",
    color: "#b45309",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },

  form: {
    display: "grid",
    gap: "16px",
  },

  inputGroup: {
    display: "grid",
    gap: "8px",
  },

  label: {
    color: "#334155",
    fontWeight: 700,
    fontSize: "14px",
  },

  input: {
    padding: "14px 14px",
    borderRadius: "16px",
    border: "1px solid #dbe4f0",
    background: "#f8fbff",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "6px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    flex: 1,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: "16px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
  },

  secondaryBtn: {
    border: "none",
    background: "#e2e8f0",
    color: "#334155",
    padding: "14px 18px",
    borderRadius: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },

  tableTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  tableSubtext: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "14px",
  },

  searchInput: {
    minWidth: "290px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #dbe4f0",
    background: "#f8fbff",
    outline: "none",
    fontSize: "14px",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 12px",
  },

  th: {
    textAlign: "left",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 800,
    padding: "0 14px 8px 14px",
  },

  tr: {
    background: "#fdfefe",
    boxShadow: "0 8px 18px rgba(15,23,42,0.05)",
  },

  td: {
    padding: "16px 14px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
  },

  patientCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #60a5fa, #06b6d4)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "13px",
    boxShadow: "0 8px 18px rgba(59,130,246,0.25)",
  },

  patientId: {
    fontWeight: 800,
    color: "#0f172a",
  },

  smallText: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "3px",
  },

  amountText: {
    fontWeight: 800,
    color: "#1d4ed8",
  },

  methodBadge: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "capitalize",
  },

  idText: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#475569",
    wordBreak: "break-all",
  },

  actionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  editBtn: {
    border: "none",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
    background: "#f8fbff",
    borderRadius: "18px",
  },
};

function getStatusStyle(status) {
  const base = {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "capitalize",
  };

  if (status === "completed") {
    return {
      ...base,
      background: "#dcfce7",
      color: "#15803d",
    };
  }

  if (status === "failed") {
    return {
      ...base,
      background: "#fee2e2",
      color: "#b91c1c",
    };
  }

  return {
    ...base,
    background: "#fef3c7",
    color: "#b45309",
  };
}
