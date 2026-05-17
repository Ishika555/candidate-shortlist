// ============================================================
// routes/candidateRoutes.js
// Defines HTTP routes for candidate management.
// Each route maps to a controller function.
// ============================================================

const express = require("express");
const router = express.Router();
const {
  addCandidate,
  getAllCandidates,
  deleteCandidate,
} = require("../controllers/candidateController");

// POST   /api/candidates       → Add a new candidate
router.post("/", addCandidate);

// GET    /api/candidates        → Get all candidates (supports ?search= query)
router.get("/", getAllCandidates);

// DELETE /api/candidates/:id    → Delete a candidate by ID
router.delete("/:id", deleteCandidate);

module.exports = router;
