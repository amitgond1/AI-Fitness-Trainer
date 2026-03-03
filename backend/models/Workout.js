const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    exercise: { type: String, required: true },
    reps: { type: Number, default: 0 },
    sets: { type: Number, default: 1 },
    duration: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    difficulty: { type: String, default: "Beginner" },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
