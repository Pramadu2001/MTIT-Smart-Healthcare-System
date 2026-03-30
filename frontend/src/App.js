import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import LabResults from './pages/LabResults';
import Payments from './pages/Payments';
import './styles/App.css';

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "📊", color: "#6366f1" },
    { id: "patients", label: "Patients", icon: "👥", color: "#3b82f6" },
    { id: "doctors", label: "Doctors", icon: "👨‍⚕️", color: "#10b981" },
    { id: "appointments", label: "Appointments", icon: "📅", color: "#f59e0b" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊", color: "#ef4444" },
    { id: "lab", label: "Lab Results", icon: "🔬", color: "#8b5cf6" },
    { id: "payments", label: "Payments", icon: "💰", color: "#14b8a6" },
];

const PAGES = {
    dashboard: Dashboard,
    patients: Patients,
    doctors: Doctors,
    appointments: Appointments,
    prescriptions: Prescriptions,
    lab: LabResults,
    payments: Payments,
};

export default function App() {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const PageComponent = PAGES[currentPage];

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={closeSidebar}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(2px)",
                        zIndex: 998,
                    }}
                />
            )}
            
            {/* Sidebar */}
            <aside
                className="sidebar"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 260,
                    background: "#ffffff",
                    transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                    zIndex: 1000,
                    boxShadow: "2px 0 20px rgba(0,0,0,0.03)",
                    borderRight: "1px solid #eff3f6",
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto",
                }}
            >
                <div style={{
                    padding: "24px 20px",
                    borderBottom: "1px solid #f0f2f5",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}>
                    <span style={{
                        fontSize: 28,
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #0f172a, #2d3a5e)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        ✚
                    </span>
                    <span style={{ fontSize: 19, fontWeight: 700, color: "#0f172a" }}>MediCore</span>
                </div>
                
                <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentPage(item.id);
                                closeSidebar();
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 16px",
                                borderRadius: 14,
                                border: "none",
                                width: "100%",
                                textAlign: "left",
                                background: currentPage === item.id ? "#f1f5f9" : "transparent",
                                color: currentPage === item.id ? item.color : "#475569",
                                fontWeight: currentPage === item.id ? 600 : 500,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: 14,
                                transition: "all 0.1s",
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                <div style={{
                    padding: "20px",
                    borderTop: "1px solid #f0f2f5",
                    fontSize: 11,
                    color: "#94a3b8",
                    textAlign: "center",
                }}>
                    v2.0 · Microservices
                </div>
            </aside>
            
            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: 0,
                width: "100%",
                transition: "margin 0.2s",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>
                <header style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #eff3f6",
                    padding: "0 24px",
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 99,
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.92)",
                }}>
                    <button
                        className="menu-toggle"
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            background: "none",
                            border: "none",
                            fontSize: 22,
                            cursor: "pointer",
                            padding: 8,
                            borderRadius: 40,
                            color: "#1e293b",
                        }}
                    >
                        ☰
                    </button>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#1f2a44" }}>
                        {NAV_ITEMS.find(n => n.id === currentPage)?.label || "Dashboard"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            background: "#ecfdf5",
                            padding: "5px 14px",
                            borderRadius: 40,
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#0b5e42",
                        }}>
                            ⚡ API:8000
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8,
                            background: "#f1f5f9", borderRadius: 40, padding: "4px 12px" }}>
                            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>
                                👑 Admin User
                            </span>
                        </div>
                    </div>
                </header>
                
                <div style={{
                    padding: "28px 24px",
                    flex: 1,
                    overflowY: "auto",
                    maxWidth: 1600,
                    margin: "0 auto",
                    width: "100%",
                }}>
                    <PageComponent />
                </div>
            </main>
            
            <style>{`
                @media (min-width: 1024px) {
                    .sidebar {
                        transform: translateX(0) !important;
                        position: sticky !important;
                    }
                    .menu-toggle {
                        display: none !important;
                    }
                }
                @media (max-width: 1023px) {
                    .sidebar {
                        box-shadow: 0 20px 35px rgba(0,0,0,0.1);
                    }
                }
            `}</style>
        </div>
    );
}