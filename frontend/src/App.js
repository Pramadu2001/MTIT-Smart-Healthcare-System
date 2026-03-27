import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import LabResults from "./pages/LabResults";
import Payments from "./pages/Payments";

const NAV = [
  { id: "dashboard",     label: "Dashboard",     icon: "⬛", color: "#6366f1" },
  { id: "patients",      label: "Patients",       icon: "🟦", color: "#0ea5e9" },
  { id: "doctors",       label: "Doctors",        icon: "🟩", color: "#10b981" },
  { id: "appointments",  label: "Appointments",   icon: "🟧", color: "#f59e0b" },
  { id: "prescriptions", label: "Prescriptions",  icon: "🟥", color: "#ef4444" },
  { id: "lab",           label: "Lab Results",    icon: "🟪", color: "#8b5cf6" },
  { id: "payments",      label: "Payments",       icon: "🟫", color: "#14b8a6" },
];

const PAGES = {
  dashboard:     Dashboard,
  patients:      Patients,
  doctors:       Doctors,
  appointments:  Appointments,
  prescriptions: Prescriptions,
  lab:           LabResults,
  payments:      Payments,
};

export default function App() {
  const [page, setPage]       = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const Page = PAGES[page];

  return (
    <div style={s.root}>
      {/* SIDEBAR */}
      <aside style={{ ...s.sidebar, width: collapsed ? 64 : 220 }}>
        <div style={s.brand} onClick={() => setCollapsed(!collapsed)}>
          <span style={s.brandIcon}>✚</span>
          {!collapsed && <span style={s.brandText}>MediCore</span>}
        </div>

        <nav style={s.nav}>
          {NAV.map(item => (
            <button
              key={item.id}
              style={{
                ...s.navBtn,
                background: page === item.id ? "rgba(255,255,255,0.12)" : "transparent",
                borderLeft: page === item.id ? `3px solid ${item.color}` : "3px solid transparent",
              }}
              onClick={() => setPage(item.id)}
              title={item.label}
            >
              <span style={{ fontSize: 16, minWidth: 20 }}>{item.icon}</span>
              {!collapsed && <span style={s.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={s.sideFooter}>
          {!collapsed && <span style={s.sideFooterTxt}>Healthcare System v1.0</span>}
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        {/* TOP BAR */}
        <header style={s.topbar}>
          <div style={s.topTitle}>
            {NAV.find(n => n.id === page)?.label}
          </div>
          <div style={s.topRight}>
            <div style={s.apiPill}>API Gateway · Port 8000</div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={s.content}>
          <Page />
        </div>
      </main>
    </div>
  );
}

const s = {
  root:        { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  sidebar:     { background: "#0f172a", display: "flex", flexDirection: "column",
                 transition: "width .25s ease", flexShrink: 0, overflow: "hidden" },
  brand:       { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px",
                 cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,.07)" },
  brandIcon:   { fontSize: 22, color: "#38bdf8", fontWeight: 900 },
  brandText:   { color: "#f8fafc", fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", whiteSpace: "nowrap" },
  nav:         { flex: 1, padding: "12px 0", display: "flex", flexDirection: "column", gap: 2 },
  navBtn:      { display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
                 border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 13,
                 fontWeight: 500, textAlign: "left", transition: "all .15s", width: "100%",
                 fontFamily: "inherit" },
  navLabel:    { whiteSpace: "nowrap" },
  sideFooter:  { padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,.07)" },
  sideFooterTxt: { color: "#475569", fontSize: 11 },
  main:        { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar:      { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 28px",
                 height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
                 flexShrink: 0 },
  topTitle:    { fontSize: 17, fontWeight: 700, color: "#0f172a" },
  topRight:    { display: "flex", alignItems: "center", gap: 12 },
  apiPill:     { background: "#f0fdf4", color: "#15803d", fontSize: 12, fontWeight: 600,
                 padding: "5px 12px", borderRadius: 20, border: "1px solid #bbf7d0" },
  content:     { flex: 1, padding: "24px 28px", overflowY: "auto" },
};