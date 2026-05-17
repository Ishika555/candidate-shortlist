// ============================================================
// pages/AIShortlistPage.jsx
// Uses the OpenRouter AI API to intelligently rank candidates.
// Also includes a bonus: AI-generated interview questions.
// ============================================================

import React, { useState } from "react";
import { Sparkles, Plus, X, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { aiMatch, getInterviewQuestions } from "../utils/api";

// Difficulty label colours
const DIFFICULTY_COLORS = {
  Easy: "var(--accent-green)",
  Medium: "var(--accent-yellow)",
  Hard: "var(--accent-red)",
};

// Single result card showing AI analysis
const AIResultCard = ({ result, index, onGenerateQuestions }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);

  const fitColors = {
    "Strong Fit": "var(--accent-green)",
    "Moderate Fit": "var(--accent-yellow)",
    "Weak Fit": "var(--accent-red)",
  };

  // Fetch AI interview questions for this candidate
  const handleShowQuestions = async () => {
    if (questions.length > 0) {
      setShowQuestions((v) => !v);
      return;
    }
    setQLoading(true);
    try {
      const qs = await onGenerateQuestions(result.name);
      setQuestions(qs);
      setShowQuestions(true);
    } catch {
      setQuestions([{ question: "Failed to load questions.", skill: "-", difficulty: "Easy" }]);
      setShowQuestions(true);
    } finally {
      setQLoading(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        borderLeft: `3px solid ${fitColors[result.fitLabel] || "var(--border)"}`,
        padding: "20px 24px",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Rank number */}
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              flexShrink: 0,
            }}
          >
            #{index + 1}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{result.name}</h3>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {result.experience} yrs · {result.email}
            </span>
          </div>
        </div>

        {/* Score and fit label */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
              color: fitColors[result.fitLabel] || "var(--text-primary)",
            }}
          >
            {result.score}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: fitColors[result.fitLabel] || "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {result.fitLabel}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {(result.skills || []).map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>

      {/* AI reason / recommendation */}
      <div
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: 12,
          display: "flex",
          gap: 8,
        }}
      >
        <Brain size={14} style={{ flexShrink: 0, marginTop: 2, color: "var(--accent-light)" }} />
        <span>{result.reason}</span>
      </div>

      {/* Toggle interview questions */}
      <button
        className="btn btn-secondary"
        style={{ fontSize: 12, padding: "6px 12px" }}
        onClick={handleShowQuestions}
        disabled={qLoading}
      >
        {qLoading ? (
          <><span className="spinner" style={{ width: 13, height: 13 }} /> Generating…</>
        ) : showQuestions ? (
          <><ChevronUp size={13} /> Hide Questions</>
        ) : (
          <><Sparkles size={13} /> AI Interview Questions</>
        )}
      </button>

      {/* Interview questions list */}
      {showQuestions && questions.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {q.skill}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: DIFFICULTY_COLORS[q.difficulty] || "var(--text-secondary)",
                  }}
                >
                  {q.difficulty}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-primary)" }}>{q.question}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────

const AIShortlistPage = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [minExperience, setMinExperience] = useState("");

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Add skill helper ──────────────────────────────────────
  const addSkill = (input, setInput, list, setList) => {
    const s = input.trim();
    if (!s || list.some((x) => x.toLowerCase() === s.toLowerCase())) return;
    setList((p) => [...p, s]);
    setInput("");
  };

  const removeSkill = (s, setList) =>
    setList((p) => p.filter((x) => x !== s));

  // ── AI match handler ──────────────────────────────────────
  const handleAIMatch = async () => {
    if (requiredSkills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }
    setError("");
    setLoading(true);
    setHasSearched(false);

    try {
      const res = await aiMatch({
        jobTitle,
        requiredSkills,
        preferredSkills,
        minExperience: minExperience ? Number(minExperience) : 0,
      });
      setResults(res.data.data || []);
      setHasSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || "AI shortlisting failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  // ── Generate interview questions for a specific candidate ─
  const handleGenerateQuestions = async (candidateName) => {
    const res = await getInterviewQuestions({
      requiredSkills,
      jobTitle,
      candidateName,
    });
    return res.data.data;
  };

  return (
    <div>
      <div className="page-header">
        <h2>AI-Powered Shortlist</h2>
        <p>Let AI intelligently rank and explain candidate suitability</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* ── Left: Job form ── */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} color="var(--accent-light)" /> AI Job Analysis
          </h3>

          {/* Job Title */}
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          {/* Required Skills */}
          <div className="form-group">
            <label>Required Skills *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. React"
                value={requiredSkillInput}
                onChange={(e) => setRequiredSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(requiredSkillInput, setRequiredSkillInput, requiredSkills, setRequiredSkills);
                  }
                }}
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
                <span key={s} className="skill-tag" style={{ cursor: "pointer" }}
                  onClick={() => removeSkill(s, setRequiredSkills)}>
                  {s} <X size={10} />
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="form-group">
            <label>Preferred Skills</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. TypeScript"
                value={preferredSkillInput}
                onChange={(e) => setPreferredSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(preferredSkillInput, setPreferredSkillInput, preferredSkills, setPreferredSkills);
                  }
                }}
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
                <span key={s} className="skill-tag" style={{ cursor: "pointer" }}
                  onClick={() => removeSkill(s, setPreferredSkills)}>
                  {s} <X size={10} />
                </span>
              ))}
            </div>
          </div>

          {/* Min experience */}
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
            onClick={handleAIMatch}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} /> AI is analysing…</>
            ) : (
              <><Sparkles size={15} /> Run AI Shortlist</>
            )}
          </button>

          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
            Powered by OpenRouter · GPT-4o-mini
          </p>
        </div>

        {/* ── Right: AI Results ── */}
        <div>
          {loading && (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)" }}>
              <div className="spinner" style={{ margin: "0 auto 16px", width: 28, height: 28, borderWidth: 3 }} />
              <p style={{ fontWeight: 500 }}>AI is ranking candidates…</p>
              <p style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>This may take a few seconds</p>
            </div>
          )}

          {hasSearched && !loading && (
            <>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                  AI ranked {results.length} candidate{results.length !== 1 ? "s" : ""}
                </h3>
              </div>

              {results.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  <p>No candidates meet the criteria.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {results.map((result, i) => (
                    <AIResultCard
                      key={i}
                      result={result}
                      index={i}
                      onGenerateQuestions={handleGenerateQuestions}
                    />
                  ))}
                </div>
              )}
            </>
          )}

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
              <Brain size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p>Fill in requirements and run <strong>"AI Shortlist"</strong></p>
              <p style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>
                AI will explain why each candidate is or isn't a fit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIShortlistPage;
