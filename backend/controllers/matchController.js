// ============================================================
// controllers/matchController.js
// Handles both basic rule-based matching AND AI-powered ranking.
// The basic match uses skill overlap + experience filtering.
// The AI match sends candidate profiles to OpenRouter for analysis.
// ============================================================

const Candidate = require("../models/Candidate");
const fetch = require("node-fetch");

// ── HELPER: Calculate match score for one candidate ──────────
// Returns a score between 0 and 1 based on skill overlap percentage
const calculateMatchScore = (candidateSkills, requiredSkills, preferredSkills = []) => {
  // Normalize all skill strings to lowercase for fair comparison
  const cSkills = candidateSkills.map((s) => s.toLowerCase());
  const rSkills = requiredSkills.map((s) => s.toLowerCase());
  const pSkills = (preferredSkills || []).map((s) => s.toLowerCase());

  // Find how many required skills the candidate has
  const matchedRequired = rSkills.filter((skill) => cSkills.includes(skill));

  // Find how many preferred (bonus) skills the candidate has
  const matchedPreferred = pSkills.filter((skill) => cSkills.includes(skill));

  // Core score: required skills match (0–1)
  const requiredScore =
    rSkills.length > 0 ? matchedRequired.length / rSkills.length : 1;

  // Bonus score: each preferred skill adds a small weight
  const preferredBonus =
    pSkills.length > 0 ? (matchedPreferred.length / pSkills.length) * 0.2 : 0;

  // Clamp final score to 1.0 maximum
  return Math.min(1, requiredScore + preferredBonus);
};

// ── HELPER: Assign a label based on numeric score ─────────────
const getMatchLabel = (score) => {
  if (score >= 0.75) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
};

// ── BASIC SHORTLIST ───────────────────────────────────────────
// POST /api/match
// Filters candidates by minimum experience, then ranks by skill score
const basicShortlist = async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;

    // Validate that required skills are provided
    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one required skill must be provided.",
      });
    }

    // Fetch all candidates from the database
    const allCandidates = await Candidate.find();

    // Filter out candidates who don't meet the minimum experience threshold
    const experienceFiltered = allCandidates.filter(
      (c) => c.experience >= (minExperience || 0)
    );

    // Score and rank each remaining candidate
    const ranked = experienceFiltered
      .map((candidate) => {
        const score = calculateMatchScore(
          candidate.skills,
          requiredSkills,
          preferredSkills
        );

        // Find which required skills the candidate actually has
        const matchedSkills = requiredSkills.filter((skill) =>
          candidate.skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
        );

        return {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          skills: candidate.skills,
          experience: candidate.experience,
          bio: candidate.bio,
          matchScore: Math.round(score * 100), // Convert to percentage
          matchLabel: getMatchLabel(score),
          matchedSkills,
        };
      })
      // Sort: highest score first
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── AI-POWERED SHORTLIST ──────────────────────────────────────
// POST /api/ai/shortlist
// Sends top candidates + job requirements to OpenRouter for intelligent ranking
const aiShortlist = async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills, jobTitle } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Required skills are needed for AI analysis.",
      });
    }

    // Fetch and pre-filter candidates (same as basic shortlist)
    const allCandidates = await Candidate.find();
    const filtered = allCandidates.filter(
      (c) => c.experience >= (minExperience || 0)
    );

    if (filtered.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No candidates match the minimum experience.",
        data: [],
      });
    }

    // Build a readable summary of each candidate for the AI prompt
    const candidateSummaries = filtered
      .map(
        (c, i) =>
          `${i + 1}. ${c.name} | Skills: ${c.skills.join(", ")} | Experience: ${c.experience} years${c.bio ? ` | Bio: ${c.bio}` : ""}`
      )
      .join("\n");

    // Construct the AI prompt with clear instructions
    const prompt = `
You are a professional technical recruiter with deep expertise in software engineering roles.

Job Requirements:
- Title: ${jobTitle || "Software Developer"}
- Required Skills: ${requiredSkills.join(", ")}
- Preferred Skills: ${(preferredSkills || []).join(", ") || "None"}
- Minimum Experience: ${minExperience || 0} years

Candidates:
${candidateSummaries}

Task:
1. Rank ALL candidates from most suitable to least suitable for this role.
2. For each candidate provide:
   - Rank number
   - Name
   - A match score out of 100
   - A 1-2 sentence explanation of why they are suitable or not
   - Whether they are a "Strong Fit", "Moderate Fit", or "Weak Fit"

Respond ONLY with a valid JSON array (no markdown, no extra text) in this exact format:
[
  {
    "rank": 1,
    "name": "Candidate Name",
    "score": 92,
    "fitLabel": "Strong Fit",
    "reason": "Explanation here."
  }
]
    `.trim();

    // Call the OpenRouter API with the constructed prompt
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // OpenRouter requires site and app name headers for routing
        "HTTP-Referer": "https://candidate-shortlist.app",
        "X-Title": "Candidate Shortlisting System",
      },
      body: JSON.stringify({
        // Use a capable model — change to a cheaper one if needed
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Low temperature = more consistent, structured output
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`OpenRouter API error: ${aiResponse.status} — ${errText}`);
    }

    const aiData = await aiResponse.json();

    // Extract the text content from the AI response
    const rawText = aiData.choices?.[0]?.message?.content || "[]";

    // Safely parse JSON, stripping any accidental markdown code fences
    let aiRankings = [];
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      aiRankings = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, return the raw text so the frontend can display it
      return res.status(200).json({
        success: true,
        rawResponse: rawText,
        data: [],
      });
    }

    // Merge AI rankings back with full candidate data from the database
    const enriched = aiRankings.map((ranking) => {
      // Find the full candidate record by name match
      const fullCandidate = filtered.find(
        (c) => c.name.toLowerCase() === ranking.name.toLowerCase()
      );
      return {
        ...ranking,
        skills: fullCandidate?.skills || [],
        experience: fullCandidate?.experience || 0,
        email: fullCandidate?.email || "",
        bio: fullCandidate?.bio || "",
        _id: fullCandidate?._id || null,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── AI INTERVIEW QUESTIONS (Bonus Feature) ───────────────────
// POST /api/ai/interview-questions
// Generates role-specific interview questions using AI
const generateInterviewQuestions = async (req, res) => {
  try {
    const { requiredSkills, jobTitle, candidateName } = req.body;

    const prompt = `
Generate 5 technical interview questions for a ${jobTitle || "Software Developer"} role 
focusing on these skills: ${(requiredSkills || []).join(", ")}.
${candidateName ? `The candidate's name is ${candidateName}.` : ""}

Respond ONLY with a valid JSON array in this format (no markdown):
[
  {
    "question": "Question text here?",
    "skill": "Relevant skill",
    "difficulty": "Easy | Medium | Hard"
  }
]
    `.trim();

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://candidate-shortlist.app",
        "X-Title": "Candidate Shortlisting System",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      }),
    });

    const aiData = await aiResponse.json();
    const rawText = aiData.choices?.[0]?.message?.content || "[]";

    let questions = [];
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      questions = [{ question: rawText, skill: "General", difficulty: "Medium" }];
    }

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { basicShortlist, aiShortlist, generateInterviewQuestions };
