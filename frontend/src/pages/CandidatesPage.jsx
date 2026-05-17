// ============================================================
// pages/CandidatesPage.jsx
// Shows all stored candidates with search/filter functionality.
// Allows deleting individual candidates.
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { Search, Users, RefreshCw } from "lucide-react";
import CandidateCard from "../components/CandidateCard";
import { fetchCandidates, deleteCandidate } from "../utils/api";

const CandidatesPage = () => {
  // All candidate data from the API
  const [candidates, setCandidates] = useState([]);
  // Loading state for the initial fetch
  const [loading, setLoading] = useState(true);
  // Error message if fetch fails
  const [error, setError] = useState("");
  // Search input value
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch candidates from the backend ─────────────────────
  const loadCandidates = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCandidates(query);
      setCandidates(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on first render
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // ── Handle search with debounce ────────────────────────────
  useEffect(() => {
    // Wait 400ms after user stops typing before sending the request
    const timer = setTimeout(() => loadCandidates(searchQuery), 400);
    return () => clearTimeout(timer); // Clean up on next keystroke
  }, [searchQuery, loadCandidates]);

  // ── Handle delete ──────────────────────────────────────────
  const handleDelete = async (id) => {
    // Confirm before permanently deleting
    if (!window.confirm("Are you sure you want to remove this candidate?")) return;

    try {
      await deleteCandidate(id);
      // Remove from local state without refetching (optimistic update)
      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete candidate.");
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <h2>All Candidates</h2>
        <p>Browse and manage your candidate pool</p>
      </div>

      {/* ── Search Bar + Refresh ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
            }}
          />
          <input
            type="text"
            placeholder="Search by name, email, or skill…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => { setSearchQuery(""); loadCandidates(); }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stat-card" style={{ display: "inline-flex", marginBottom: 24, minWidth: 160 }}>
        <span className="stat-value">{candidates.length}</span>
        <span className="stat-label">Total Candidates</span>
      </div>

      {/* ── Error State ── */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Loading State ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          <p>Loading candidates…</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && candidates.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--text-secondary)",
          }}
        >
          <Users size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>No candidates found</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            {searchQuery ? "Try a different search term." : 'Click "Add Candidate" to get started.'}
          </p>
        </div>
      )}

      {/* ── Candidate Grid ── */}
      {!loading && candidates.length > 0 && (
        <div className="grid-2">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
