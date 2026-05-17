// ============================================================
// pages/AddCandidatePage.jsx
// Form to add a new candidate to the database.
// Skills are entered as comma-separated values and split into an array.
// ============================================================

import React, { useState } from "react";
import { UserPlus, Plus, X, CheckCircle } from "lucide-react";
import { addCandidate } from "../utils/api";

// Initial empty form state — reused on reset
const INITIAL_FORM = {
  name: "",
  email: "",
  skillInput: "",   // Temporary input before adding to skills array
  skills: [],
  experience: "",
  bio: "",
};

const AddCandidatePage = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Update a field in the form state ──────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear any previous error/success when the user starts typing
    setError("");
    setSuccess(false);
  };

  // ── Add a skill tag ─────────────────────────────────────────
  const handleAddSkill = () => {
    const skill = form.skillInput.trim();
    if (!skill) return;

    // Prevent duplicate skills (case-insensitive check)
    if (form.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setError(`"${skill}" is already in the skills list.`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
      skillInput: "", // Clear the input after adding
    }));
  };

  // ── Allow pressing Enter to add skill ────────────────────
  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Don't submit the form
      handleAddSkill();
    }
  };

  // ── Remove a skill from the array ────────────────────────
  const handleRemoveSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // ── Submit the form ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic client-side validation
    if (!form.name || !form.email || !form.experience) {
      setError("Name, email, and experience are required.");
      return;
    }

    if (form.skills.length === 0) {
      setError("Please add at least one skill.");
      return;
    }

    setLoading(true);
    try {
      await addCandidate({
        name: form.name.trim(),
        email: form.email.trim(),
        skills: form.skills,
        experience: Number(form.experience),
        bio: form.bio.trim(),
      });

      setSuccess(true);
      // Reset form after successful submission
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add candidate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <h2>Add New Candidate</h2>
        <p>Fill in the candidate's profile to add them to the system</p>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="card">
          <form onSubmit={handleSubmit}>

            {/* ── Success Message ── */}
            {success && (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                <CheckCircle size={15} />
                Candidate added successfully!
              </div>
            )}

            {/* ── Error Message ── */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* ── Full Name ── */}
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            {/* ── Email ── */}
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="e.g. rahul@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            {/* ── Experience ── */}
            <div className="form-group">
              <label>Years of Experience *</label>
              <input
                type="number"
                placeholder="e.g. 3"
                min="0"
                max="50"
                value={form.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
              />
            </div>

            {/* ── Skills Input ── */}
            <div className="form-group">
              <label>Skills</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter or click Add"
                  value={form.skillInput}
                  onChange={(e) => handleChange("skillInput", e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSkill}
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>

              {/* Display added skill tags */}
              {form.skills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="skill-tag"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRemoveSkill(skill)}
                      title="Click to remove"
                    >
                      {skill}
                      <X size={10} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Bio / Projects ── */}
            <div className="form-group">
              <label>Bio / Projects (optional)</label>
              <textarea
                placeholder="Brief description of projects, experience, or background…"
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16 }} />
                  Adding Candidate…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add Candidate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCandidatePage;
