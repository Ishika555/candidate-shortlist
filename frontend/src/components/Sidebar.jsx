// ============================================================
// components/Sidebar.jsx
// Fixed left navigation sidebar with icon + label nav items.
// Highlights the currently active page.
// ============================================================

import React from "react";
import {
  Users,
  Search,
  Sparkles,
  BarChart2,
  UserPlus,
  Cpu,
} from "lucide-react";

// Navigation items: each maps to a page key used by the parent App
const NAV_ITEMS = [
  { key: "candidates",    label: "Candidates",     icon: Users },
  { key: "add",           label: "Add Candidate",  icon: UserPlus },
  { key: "match",         label: "Basic Match",    icon: Search },
  { key: "ai",            label: "AI Shortlist",   icon: Sparkles },
  { key: "charts",        label: "Analytics",      icon: BarChart2 },
];

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <aside className="sidebar">
      {/* App branding */}
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Cpu size={20} color="var(--accent-light)" />
          <h1>HireAI</h1>
        </div>
        <span>Shortlisting System</span>
      </div>

      {/* Navigation links */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className={`nav-item ${activePage === key ? "active" : ""}`}
            onClick={() => onNavigate(key)}
            role="button"
            tabIndex={0}
            // Allow keyboard navigation
            onKeyDown={(e) => e.key === "Enter" && onNavigate(key)}
          >
            <Icon size={17} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* Footer note */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          v1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
