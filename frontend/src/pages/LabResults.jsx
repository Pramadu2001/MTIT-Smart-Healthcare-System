import { useEffect, useState } from "react";
import { useApi, api, useToast } from "../utils";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import Toast from "../components/Toast";

const EMPTY = {
  patient_id: "",
  test_name: "",
  result_value: "",
  status: "Pending",
  date: "",
};

export default function LabResults() {
  const { data, loading, error, load } = useApi("lab-results");
  const { toast, show } = useToast();
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(EMPTY);
  const [editId, setEditId]           = useState(null);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState("");
  const [formErrors, setFormErrors]   = useState({});

  useEffect(() => {
    load();
  }, []);

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const errors = {};

    if (!form.patient_id.trim())
      errors.patient_id = "Patient ID is required";
    else if (!/^[A-Za-z0-9]+$/.test(form.patient_id.trim()))
      errors.patient_id = "Patient ID must be alphanumeric (e.g. P001)";

    if (!form.test_name.trim())
      errors.test_name = "Test name is required";
    else if (form.test_name.trim().length < 3)
      errors.test_name = "Test name must be at least 3 characters";

    if (!form.result_value.trim())
      errors.result_value = "Result value is required";

    if (!form.status.trim())
      errors.status = "Status is required";

    if (!form.date)
      errors.date = "Date is required";

    return errors;
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field as user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const handleAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setForm({
      patient_id:   row.patient_id,
      test_name:    row.test_name,
      result_value: row.result_value,
      status:       row.status,
      date:         row.date,
    });
    setEditId(row._id);
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api("PUT", "lab-results/" + editId, form);
        show("Lab result updated successfully!", "ok");
      } else {
        await api("POST", "lab-results", form);
        show("Lab result added successfully!", "ok");
      }
      setShowModal(false);
      setForm(EMPTY);
      setEditId(null);
      setFormErrors({});
      load();
    } catch (err) {
      show("Failed to save lab result. Try again.", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this lab result?");
    if (!confirmed) return;
    try {
      await api("DELETE", "lab-results/" + id, null);
      show("Lab result deleted successfully", "ok");
      load();
    } catch (err) {
      show("Failed to delete lab result. Try again.", "err");
    }
  };

  // ── Search Filter ─────────────────────────────────────────────
  const filtered = data.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.patient_id?.toLowerCase().includes(q)   ||
      row.test_name?.toLowerCase().includes(q)    ||
      row.result_value?.toLowerCase().includes(q) ||
      row.status?.toLowerCase().includes(q)
    );
  });

  // ── Table Columns ─────────────────────────────────────────────
  const cols = [
    { key: "patient_id",   label: "Patient ID"   },
    { key: "test_name",    label: "Test Name"     },
    { key: "result_value", label: "Result"        },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const colors = {
          Normal:   { bg: "#ecfdf5", color: "#065f46" },
          Abnormal: { bg: "#fef2f2", color: "#b91c1c" },
          Pending:  { bg: "#fefce8", color: "#92400e" },
        };
        const style = colors[row.status] || { bg: "#f1f5f9", color: "#334155" };
        return (
          <span style={{
            background: style.bg,
            color: style.color,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {row.status}
          </span>
        );
      },
    },
    { key: "date", label: "Date" },
    {
      key: "_id",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleEdit(row)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "4px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "4px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>🧪 Lab Results</h2>
        <Btn onClick={handleAdd}>+ Add Lab Result</Btn>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "1.5rem", maxWidth: 400 }}>
        <Input
          placeholder="Search by patient ID, test name, result, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Search result count */}
      {search && (
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: "1rem" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found for "{search}"
        </p>
      )}

      {/* Content */}
      {loading && <Loading />}
      {error && <ErrorBox msg={error} />}
      {!loading && !error && (
        <Table cols={cols} rows={filtered} emptyMsg={search ? "No results match your search" : "No lab results found"} />
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editId ? "Edit Lab Result" : "Add Lab Result"}
          onClose={() => { setShowModal(false); setFormErrors({}); }}
        >
          {/* Patient ID */}
          <Input
            label="Patient ID *"
            name="patient_id"
            value={form.patient_id}
            onChange={handleChange}
            placeholder="e.g. P001"
          />
          {formErrors.patient_id && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: -4 }}>
              ⚠ {formErrors.patient_id}
            </p>
          )}

          {/* Test Name */}
          <Input
            label="Test Name *"
            name="test_name"
            value={form.test_name}
            onChange={handleChange}
            placeholder="e.g. Blood Sugar"
          />
          {formErrors.test_name && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: -4 }}>
              ⚠ {formErrors.test_name}
            </p>
          )}

          {/* Result Value */}
          <Input
            label="Result Value *"
            name="result_value"
            value={form.result_value}
            onChange={handleChange}
            placeholder="e.g. 110 mg/dL"
          />
          {formErrors.result_value && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: -4 }}>
              ⚠ {formErrors.result_value}
            </p>
          )}

          {/* Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
              Status *
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{
                padding: "11px 14px",
                borderRadius: 14,
                border: "1.5px solid #e9edf2",
                fontSize: 13,
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                background: "#ffffff",
                color: "#0f172a",
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Normal">Normal</option>
              <option value="Abnormal">Abnormal</option>
            </select>
          </div>
          {formErrors.status && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: -4 }}>
              ⚠ {formErrors.status}
            </p>
          )}

          {/* Date */}
          <Input
            label="Date *"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
          {formErrors.date && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: -4 }}>
              ⚠ {formErrors.date}
            </p>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <Btn onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editId ? "Update" : "Save"}
            </Btn>
            <Btn variant="secondary" onClick={() => { setShowModal(false); setFormErrors({}); }}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {/* Toast */}
      <Toast toast={toast} />

    </div>
  );
}