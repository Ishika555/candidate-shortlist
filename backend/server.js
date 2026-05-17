// ============================================================
// server.js — Main Entry Point
// Sets up the Express server, connects to MongoDB,
// registers all middleware and routes, then starts listening.
// ============================================================

// Load environment variables from .env file into process.env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import route files
const candidateRoutes = require("./routes/candidateRoutes");
const matchRoutes = require("./routes/matchRoutes");

// Import global error handler middleware
const errorHandler = require("./middleware/errorHandler");

// ── INITIALISE EXPRESS APP ────────────────────────────────────
const app = express();

// ── MIDDLEWARE SETUP ──────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// FIXED CORS ISSUE
app.use(cors());

// ── HEALTH CHECK ROUTE ─────────────────────────────────────────
// Simple endpoint to verify the server is running (used by Render)
app.get("/", (req, res) => {
  res.json({
    message: "✅ Candidate Shortlisting API is running.",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── REGISTER API ROUTES ───────────────────────────────────────

// All candidate CRUD operations
app.use("/api/candidates", candidateRoutes);

// Basic matching at /api/match, AI features at /api/ai/*
app.use("/api", matchRoutes);

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────

// Must be registered AFTER all routes
app.use(errorHandler);

// ── CONNECT TO MONGODB & START SERVER ─────────────────────────

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file. Exiting.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully.");

    // Only start listening for requests after DB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  });