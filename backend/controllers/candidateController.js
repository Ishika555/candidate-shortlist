// ============================================================
// controllers/candidateController.js
// Contains all business logic for candidate-related operations.
// Controllers are kept separate from routes for clean code structure.
// ============================================================

const Candidate = require("../models/Candidate");

// ── ADD A NEW CANDIDATE ──────────────────────────────────────
// POST /api/candidates
// Receives candidate data from request body and saves it to MongoDB
const addCandidate = async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;

    // Basic validation: ensure required fields are present
    if (!name || !email || experience === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and experience are required fields.",
      });
    }

    // Normalize skills to trimmed lowercase for consistent matching
    const normalizedSkills = (skills || []).map((s) => s.trim());

    // Create and save the new candidate document
    const candidate = await Candidate.create({
      name,
      email,
      skills: normalizedSkills,
      experience,
      bio: bio || "",
    });

    res.status(201).json({
      success: true,
      message: "Candidate added successfully.",
      data: candidate,
    });
  } catch (error) {
    // Handle duplicate email error specifically
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A candidate with this email already exists.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL CANDIDATES ───────────────────────────────────────
// GET /api/candidates
// Returns all stored candidates, sorted newest first
const getAllCandidates = async (req, res) => {
  try {
    // Support optional search query param: /api/candidates?search=react
    const { search } = req.query;

    let filter = {};
    if (search) {
      // Case-insensitive search across name, email, and skills
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { skills: { $elemMatch: { $regex: search, $options: "i" } } },
        ],
      };
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE A CANDIDATE ───────────────────────────────────────
// DELETE /api/candidates/:id
// Removes a single candidate by MongoDB ObjectId
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Candidate deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addCandidate, getAllCandidates, deleteCandidate };
