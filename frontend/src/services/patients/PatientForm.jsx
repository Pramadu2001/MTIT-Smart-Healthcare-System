import React, { useState } from 'react';
import { createPatient, updatePatient } from './patientApi';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
};

const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#9ca3af",
    fontFamily: "'DM Mono', 'Fira Mono', monospace",
};

const inputBase = {
    padding: "12px 0",
    border: "none",
    borderBottom: "1.5px solid #e5e7eb",
    borderRadius: 0,
    fontSize: 14,
    outline: "none",
    fontFamily: "'Lora', Georgia, serif",
    background: "transparent",
    color: "#111827",
    width: "100%",
    transition: "border-color 0.2s",
    appearance: "none",
};

function Field({ label, children }) {
    return (
        <div style={fieldStyle}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

function TextInput({ focused, setFocused, id, ...props }) {
    return (
        <input
            style={{
                ...inputBase,
                borderBottomColor: focused === id ? "#111827" : "#e5e7eb",
            }}
            onFocus={() => setFocused(id)}
            onBlur={() => setFocused(null)}
            {...props}
        />
    );
}

function SelectInput({ focused, setFocused, id, children, ...props }) {
    return (
        <div style={{ position: "relative" }}>
            <select
                style={{
                    ...inputBase,
                    borderBottomColor: focused === id ? "#111827" : "#e5e7eb",
                    cursor: "pointer",
                    paddingRight: 24,
                }}
                onFocus={() => setFocused(id)}
                onBlur={() => setFocused(null)}
                {...props}
            >
                {children}
            </select>
            <svg
                style={{
                    position: "absolute",
                    right: 4,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#9ca3af",
                }}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
            >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
}

export default function PatientForm({ existing, onDone, onCancel }) {
    const [form, setForm] = useState(existing || {
        name: '', age: '', gender: '', contact: '', address: '', blood_type: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Name is required'); return; }
        if (!form.age || form.age < 0 || form.age > 150) { setError('Valid age is required'); return; }
        if (!form.gender) { setError('Gender is required'); return; }

        setLoading(true);
        try {
            existing ? await updatePatient(existing.id, form) : await createPatient(form);
            onDone();
        } catch {
            setError('Failed to save. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            fontFamily: "'Lora', Georgia, serif",
            background: "#fff",
            maxWidth: 520,
            width: "100%",
            margin: "0 auto",
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 36,
                paddingBottom: 24,
                borderBottom: "1px solid #f3f4f6",
            }}>
                <div>
                    <div style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                        fontFamily: "'DM Mono', monospace",
                        marginBottom: 6,
                    }}>
                        {existing ? "Edit Record" : "New Record"}
                    </div>
                    <h2 style={{
                        fontSize: 22,
                        fontWeight: 400,
                        color: "#111827",
                        margin: 0,
                        letterSpacing: "-0.5px",
                    }}>
                        {existing ? existing.name : "Patient Registration"}
                    </h2>
                </div>
                <button
                    onClick={onCancel}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ca3af",
                        padding: 4,
                        lineHeight: 1,
                        fontSize: 18,
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#111827"}
                    onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                >
                    ✕
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    marginBottom: 24,
                    padding: "10px 14px",
                    background: "#fef2f2",
                    borderLeft: "2px solid #ef4444",
                    fontSize: 13,
                    color: "#b91c1c",
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "-0.01em",
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                    {/* Full name */}
                    <Field label="Full Name">
                        <TextInput
                            id="name" focused={focused} setFocused={setFocused}
                            type="text" name="name" value={form.name}
                            onChange={handleChange} placeholder="e.g. Amara Nwosu"
                            disabled={loading}
                        />
                    </Field>

                    {/* Age + Gender */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <Field label="Age">
                            <TextInput
                                id="age" focused={focused} setFocused={setFocused}
                                type="number" name="age" value={form.age}
                                onChange={handleChange} placeholder="Years"
                                min="0" max="150" disabled={loading}
                            />
                        </Field>
                        <Field label="Gender">
                            <SelectInput id="gender" focused={focused} setFocused={setFocused}
                                name="gender" value={form.gender} onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </SelectInput>
                        </Field>
                    </div>

                    {/* Contact */}
                    <Field label="Contact">
                        <TextInput
                            id="contact" focused={focused} setFocused={setFocused}
                            type="tel" name="contact" value={form.contact}
                            onChange={handleChange} placeholder="Phone number"
                            disabled={loading}
                        />
                    </Field>

                    {/* Address */}
                    <Field label="Address">
                        <TextInput
                            id="address" focused={focused} setFocused={setFocused}
                            type="text" name="address" value={form.address}
                            onChange={handleChange} placeholder="Street, city, postal code"
                            disabled={loading}
                        />
                    </Field>

                    {/* Blood type */}
                    <Field label="Blood Type">
                        <SelectInput id="blood_type" focused={focused} setFocused={setFocused}
                            name="blood_type" value={form.blood_type} onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="">Not specified</option>
                            {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </SelectInput>
                    </Field>

                    {/* Actions */}
                    <div style={{
                        display: "flex",
                        gap: 12,
                        paddingTop: 24,
                        marginTop: 4,
                        borderTop: "1px solid #f3f4f6",
                    }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "13px",
                                background: "none",
                                border: "1.5px solid #e5e7eb",
                                borderRadius: 8,
                                fontSize: 13,
                                fontFamily: "'DM Mono', monospace",
                                letterSpacing: "0.04em",
                                color: "#6b7280",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#111827";
                                e.currentTarget.style.color = "#111827";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#e5e7eb";
                                e.currentTarget.style.color = "#6b7280";
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 2,
                                padding: "13px",
                                background: "#111827",
                                border: "1.5px solid #111827",
                                borderRadius: 8,
                                fontSize: 13,
                                fontFamily: "'DM Mono', monospace",
                                letterSpacing: "0.04em",
                                color: "#fff",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1f2937"; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#111827"; }}
                        >
                            {loading ? "Saving..." : existing ? "Update patient" : "Create patient"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}