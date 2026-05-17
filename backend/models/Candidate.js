// ============================================================
// models/Candidate.js
// Defines the MongoDB schema for a candidate document.
// Mongoose maps this schema to the "candidates" collection.
// ============================================================

const mongoose = require("mongoose");

// Define the shape of a candidate document in MongoDB
const CandidateSchema = new mongoose.Schema(
  {
    // Candidate's full name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // Unique email address (used as a natural identifier)
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Array of skill strings e.g. ["React", "Node.js"]
    skills: {
      type: [String],
      default: [],
    },

    // Total years of professional experience
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },

    // Optional biography or project description
    bio: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so routes can use it
module.exports = mongoose.model("Candidate", CandidateSchema);
