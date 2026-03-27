// ── Shared UI components ──────────────────────────────────────────

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: toast.type === "err" ? "#ef4444" : "#10b981",
      color: "#fff", padding: "12px 20px", borderRadius: 10,
      fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,.2)",
    }}>
      {toast.msg}
    </div>
  );
}

export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, color = "#6366f1", sub }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "20px 22px",
      boxShadow: "0 1px 8px rgba(0,0,0,.06)", border: "1px solid #f1f5f9",
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", type = "button", style: extra }) {
  const base = {
    padding: "10px 20px", border: "none", borderRadius: 8,
    fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
    transition: "opacity .15s", ...extra,
  };
  const variants = {
    primary:  { background: "#0f172a", color: "#fff" },
    danger:   { background: "#fff0f0", color: "#ef4444", border: "1px solid #fecaca" },
    ghost:    { background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0" },
    success:  { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
  };
  return <button type={type} style={{ ...base, ...variants[variant] }} onClick={onClick}>{children}</button>;
}

export function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>}
      <input style={{
        padding: "10px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0",
        fontSize: 13, outline: "none", fontFamily: "inherit", color: "#0f172a",
        background: "#fafafa",
      }} {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>}
      <select style={{
        padding: "10px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0",
        fontSize: 13, outline: "none", fontFamily: "inherit", color: "#0f172a",
        background: "#fafafa",
      }} {...props}>{children}</select>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 32px",
        width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Table({ cols, rows, emptyMsg = "No records found" }) {
  if (rows.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>{emptyMsg}</div>
  );
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
          {cols.map(c => (
            <th key={c.key} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700,
              color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
            {cols.map(c => (
              <td key={c.key} style={{ padding: "12px 14px", color: "#334155", verticalAlign: "middle" }}>
                {c.render ? c.render(row) : row[c.key] ?? "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Card({ children, style: extra }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,.06)",
      border: "1px solid #f1f5f9", overflow: "hidden", ...extra,
    }}>
      {children}
    </div>
  );
}

export function Badge({ label, color = "#6366f1" }) {
  return (
    <span style={{
      background: color + "18", color, fontSize: 11, fontWeight: 700,
      padding: "3px 9px", borderRadius: 20, border: `1px solid ${color}30`,
    }}>{label}</span>
  );
}

export function Grid({ cols = 2, gap = 16, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

export function Loading() {
  return <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading...</div>;
}

export function ErrorBox({ msg }) {
  return (
    <div style={{ padding: "20px", background: "#fff5f5", border: "1px solid #fecaca",
      borderRadius: 10, color: "#ef4444", fontSize: 14 }}>
      ⚠️ {msg}
    </div>
  );
}