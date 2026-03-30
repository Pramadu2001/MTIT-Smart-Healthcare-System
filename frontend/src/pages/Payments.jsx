import React, { useEffect, useState } from "react";
import "./App.css";

export default function Payments() {
  const API_BASE = "http://localhost:8006";

  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    amount: "",
    method: "cash",
    status: "pending",
  });

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE}/payments`);
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (error) {
      setMessage("Failed to load payments");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_BASE}/payments/${editingId}`
      : `${API_BASE}/payments`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Error occurred");
        return;
      }

      setMessage(editingId ? "Updated successfully" : "Added successfully");
      setEditingId(null);
      setFormData({
        patient_id: "",
        amount: "",
        method: "cash",
        status: "pending",
      });

      fetchPayments();
    } catch (error) {
      setMessage("Server error");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      patient_id: p.patient_id,
      amount: p.amount,
      method: p.method,
      status: p.status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      const res = await fetch(`${API_BASE}/payments/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Delete failed");
        return;
      }

      setMessage("Deleted successfully");
      fetchPayments();
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">💳 Payment Dashboard</h1>
      <p className="page-subtitle">
        Manage and monitor patient payments in one place
      </p>

      {message && <div className="message">{message}</div>}

      <div className="card">
        <h2 className="card-title">
          {editingId ? "Update Payment" : "Add New Payment"}
        </h2>

        <form className="form" onSubmit={handleSubmit}>
          <input
            name="patient_id"
            placeholder="Patient ID"
            value={formData.patient_id}
            onChange={handleChange}
            required
          />

          <input
            name="amount"
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <select name="method" value={formData.method} onChange={handleChange}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <div className="button-row">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Payment" : "Add Payment"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    patient_id: "",
                    amount: "",
                    method: "cash",
                    status: "pending",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="header-row">
          <h2 className="card-title">Payment Records</h2>
          <button className="btn btn-refresh" onClick={fetchPayments}>
            Refresh
          </button>
        </div>

        {payments.length === 0 ? (
          <p className="empty-text">No payments found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{p._id}</td>
                    <td>{p.patient_id}</td>
                    <td>{p.amount}</td>
                    <td>{p.method}</td>
                    <td>
                      <span className={`status ${p.status}`}>{p.status}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(p._id)}
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
  );
}
