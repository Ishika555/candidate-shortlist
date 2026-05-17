// ============================================================
// pages/ChartsPage.jsx
// Analytics dashboard: visualises candidate data using Recharts.
// Shows skill frequency, experience distribution, and match scores.
// ============================================================

import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { fetchCandidates } from "../utils/api";

// Chart colour palette
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const ChartsPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all candidates on mount
  useEffect(() => {
    fetchCandidates()
      .then((res) => setCandidates(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived chart data ─────────────────────────────────────

  // Count frequency of each skill across all candidates
  const skillFrequency = (() => {
    const counts = {};
    candidates.forEach((c) => {
      (c.skills || []).forEach((skill) => {
        const key = skill.trim().toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    // Sort by count descending, take top 10
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  })();

  // Group candidates by experience bracket
  const experienceBrackets = (() => {
    const brackets = { "0-1 yr": 0, "2-3 yrs": 0, "4-5 yrs": 0, "6+ yrs": 0 };
    candidates.forEach(({ experience }) => {
      if (experience <= 1) brackets["0-1 yr"]++;
      else if (experience <= 3) brackets["2-3 yrs"]++;
      else if (experience <= 5) brackets["4-5 yrs"]++;
      else brackets["6+ yrs"]++;
    });
    return Object.entries(brackets).map(([label, value]) => ({ label, value }));
  })();

  // Aggregate stats for summary cards
  const stats = {
    total: candidates.length,
    avgExperience: candidates.length
      ? (candidates.reduce((s, c) => s + c.experience, 0) / candidates.length).toFixed(1)
      : 0,
    uniqueSkills: new Set(candidates.flatMap((c) => c.skills.map((s) => s.toLowerCase()))).size,
  };

  // Custom tooltip for dark theme charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
        }}
      >
        <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>
        <p style={{ color: "var(--accent-light)", fontWeight: 700 }}>
          {payload[0].value} candidate{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }} />
        <p>Loading analytics…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Visual overview of your candidate pool</p>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Candidates</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.avgExperience}</span>
          <span className="stat-label">Avg Experience (yrs)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.uniqueSkills}</span>
          <span className="stat-label">Unique Skills</span>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}
        >
          <BarChart2 size={36} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p>No data yet. Add some candidates to see analytics.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* ── Top Skills Bar Chart ── */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
              Top Skills in Candidate Pool
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={skillFrequency} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="skill"
                  tick={{ fill: "var(--text-secondary)", fontSize: 12, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {skillFrequency.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Experience Pie Chart ── */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
              Experience Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={experienceBrackets}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={3}
                  label={({ label, percent }) =>
                    percent > 0 ? `${label} (${(percent * 100).toFixed(0)}%)` : ""
                  }
                  labelLine={false}
                >
                  {experienceBrackets.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value) => [value, "Candidates"]}
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsPage;
