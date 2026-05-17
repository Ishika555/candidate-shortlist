// ============================================================
// routes/matchRoutes.js
// Defines HTTP routes for job matching and AI features.
// ============================================================

const express = require("express");
const router = express.Router();
const {
  basicShortlist,
  aiShortlist,
  generateInterviewQuestions,
} = require("../controllers/matchController");

// POST /api/match              → Basic rule-based candidate shortlisting
//router.post("/", basicShortlist); ->old route
router.post("/match", basicShortlist);
// POST /api/ai/shortlist       → AI-powered candidate ranking via OpenRouter
router.post("/ai/shortlist", aiShortlist);

// POST /api/ai/interview-questions → Generate AI interview questions (bonus)
router.post("/ai/interview-questions", generateInterviewQuestions);

module.exports = router;
