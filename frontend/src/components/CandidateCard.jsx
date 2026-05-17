// ============================================================
// components/CandidateCard.jsx
// Displays a single candidate's details in a card layout.
// Shows skills as pills, experience, and optional delete button.
// ============================================================

import React from "react";
import { Trash2, Mail, Briefcase } from "lucide-react";

const CandidateCard = ({ candidate, onDelete, matchScore, matchedSkills = [] }) => {
  const { _id, name, email, skills, experience, bio } = candidate;

  // Determine if this is a match result card (has score info)
  const isMatchCard = matchScore !== undefined;

  // Get label colour class based on score percentage
  const getScoreClass = (score) => {
    if (score >= 75) return "high";
    if (score >= 40) return "medium";
    return "low";
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        // Highlight high match cards with a subtle green glow
        boxShadow: isMatchCard && matchScore >= 75
          ? "0 0 0 1px rgba(16,185,129,0.2), var(--shadow)"
          : undefined,
      }}
    >
      {/* ── Header Row: Name + actions ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13 }}>
            <Mail size={13} />
            <span>{email}</span>
          </div>
        </div>

        {/* Show match score badge if this is a match result */}
        {isMatchCard && (
          <span className={`match-badge ${getScoreClass(matchScore)}`}>
            {matchScore}%
          </span>
        )}
      </div>

      {/* ── Experience ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
        <Briefcase size={13} />
        <span>{experience} {experience === 1 ? "year" : "years"} experience</span>
      </div>

      {/* ── Skills ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {skills.map((skill) => (
          <span
            key={skill}
            // Highlight skills that matched job requirements in green
            className={`skill-tag ${matchedSkills.includes(skill) ? "matched" : ""}`}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* ── Bio / description ── */}
      {bio && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {bio}
        </p>
      )}

      {/* ── Match label (High / Medium / Low) ── */}
      {isMatchCard && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, fontSize: 12, color: "var(--text-secondary)" }}>
          Matched skills:{" "}
          {matchedSkills.length > 0 ? (
            <span style={{ color: "var(--accent-green)" }}>
              {matchedSkills.join(", ")}
            </span>
          ) : (
            <span style={{ color: "var(--accent-red)" }}>None</span>
          )}
        </div>
      )}

      {/* ── Delete button (only on full candidate list, not match results) ── */}
      {onDelete && (
        <button
          className="btn btn-danger"
          style={{ alignSelf: "flex-start", padding: "6px 12px", fontSize: 13 }}
          onClick={() => onDelete(_id)}
        >
          <Trash2 size={14} />
          Remove
        </button>
      )}
    </div>
  );
};

export default CandidateCard;
