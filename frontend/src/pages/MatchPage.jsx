// ============================================================
// pages/MatchPage.jsx
// Allows a recruiter to specify job requirements and see
// candidates ranked by basic skill overlap + experience match.
// ============================================================

import React, { useState } from "react";
import { Search, Plus, X, Filter } from "lucide-react";
import CandidateCard from "../components/CandidateCard";
import { basicMatch } from "../utils/api";

const MatchPage = () => {
  // Job requirement form state
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [minExperience, setMinExperience] = useState("");

  // Results state
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Add a skill tag to either list ───────────────────────
  const addSkill = (input, setInput, list, setList) => {
    const skill = input.trim();
    if (!skill) return;
    if (!list.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setList((prev) => [...prev, skill]);
    }
    setInput("");
  };

  // ── Remove a skill from either list ──────────────────────
  const removeSkill = (skill, setList) => {
    setList((prev) => prev.filter((s) => s !== skill));
  };

  // ── Key handler for Enter key ─────────────────────────────
  const onKeyDown = (e, addFn) => {
    if (e.key === "Enter") { e.preventDefault(); addFn(); }
  };

  // ── Run basic match ───────────────────────────────────────
  const handleMatch = async () => {
    if (requiredSkills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    setError("");
    setLoading(true);
    setHasSearched(false);

    try {
      const res = await basicMatch({
        requiredSkills,
        preferredSkills,
        minExperience: minExperience ? Number(minExperience) : 0,
      });
      setResults(res.data.data);
      setHasSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || "Matching failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <h2>Basic Candidate Match</h2>
        <p>Filter and rank candidates by skill overlap and experience</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* ── Left: Job Requirements Form ── */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={16} /> Job Requirements
          </h3>

          {/* Required Skills */}
          <div className="form-group">
            <label>Required Skills *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. React"
                value={requiredSkillInput}
                onChange={(e) => setRequiredSkillInput(e.target.value)}
                onKeyDown={(e) => onKeyDown(e, () => addSkill(requiredSkillInput, setRequiredSkillInput, requiredSkills, setRequiredSkills))}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => addSkill(requiredSkillInput, setRequiredSkillInput, requiredSkills, setRequiredSkills)}
                style={{ flexShrink: 0 }}
              >
                <Plus size={14} />
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {requiredSkills.map((s) => (
                <span key={s} className="skill-tag" style={{ cursor: "pointer" }} onClick={() => removeSkill(s, setRequiredSkills)}>
                  {s} <X size={10} />
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="form-group">
            <label>Preferred Skills (bonus)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. AWS"
                value={preferredSkillInput}
                onChange={(e) => setPreferredSkillInput(e.target.value)}
                onKeyDown={(e) => onKeyDown(e, () => addSkill(preferredSkillInput, setPreferredSkillInput, preferredSkills, setPreferredSkills))}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => addSkill(preferredSkillInput, setPreferredSkillInput, preferredSkills, setPreferredSkills)}
                style={{ flexShrink: 0 }}
              >
                <Plus size={14} />
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {preferredSkills.map((s) => (
                <span key={s} className="skill-tag" style={{ cursor: "pointer" }} onClick={() => removeSkill(s, setPreferredSkills)}>
                  {s} <X size={10} />
                </span>
              ))}
            </div>
          </div>

          {/* Minimum Experience */}
          <div className="form-group">
            <label>Minimum Experience (years)</label>
            <input
              type="number"
              placeholder="e.g. 2"
              min="0"
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary"
            onClick={handleMatch}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} /> Matching…</>
            ) : (
              <><Search size={15} /> Find Matches</>
            )}
          </button>
        </div>

        {/* ── Right: Results ── */}
        <div>
          {hasSearched && (
            <>
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                  {results.length} Candidate{results.length !== 1 ? "s" : ""} Found
                </h3>
                {/* Legend */}
                <div style={{ display: "flex", gap: 10 }}>
                  <span className="match-badge high">High</span>
                  <span className="match-badge medium">Medium</span>
                  <span className="match-badge low">Low</span>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
                  <p>No candidates match these requirements.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {results.map((candidate) => (
                    <CandidateCard
                      key={candidate._id}
                      candidate={candidate}
                      matchScore={candidate.matchScore}
                      matchedSkills={candidate.matchedSkills}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Placeholder before first search */}
          {!hasSearched && !loading && (
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--text-secondary)",
                borderStyle: "dashed",
              }}
            >
              <Search size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p>Set job requirements and click <strong>"Find Matches"</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
