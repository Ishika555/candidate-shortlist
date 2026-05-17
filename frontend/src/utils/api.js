// ============================================================
// utils/api.js
// Centralised Axios instance — all API calls go through here.
// This means we only need to update the base URL in one place.
// ============================================================

import axios from "axios";

// Read the API base URL from environment variables
// Falls back to localhost in development if not set
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout (AI calls can be slow)
});

// ── CANDIDATE API CALLS ──────────────────────────────────────

// Fetch all candidates; optional search query
export const fetchCandidates = (search = "") =>
  api.get(`/candidates${search ? `?search=${encodeURIComponent(search)}` : ""}`);

// Add a new candidate
export const addCandidate = (data) => api.post("/candidates", data);

// Delete a candidate by ID
export const deleteCandidate = (id) => api.delete(`/candidates/${id}`);

// ── MATCHING API CALLS ────────────────────────────────────────

// Basic rule-based shortlisting
export const basicMatch = (data) => api.post("/match", data);

// AI-powered shortlisting via OpenRouter
export const aiMatch = (data) => api.post("/ai/shortlist", data);

// Generate AI interview questions
export const getInterviewQuestions = (data) =>
  api.post("/ai/interview-questions", data);

export default api;
