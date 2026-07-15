const mongoose = require("mongoose");

const setDetailSchema = new mongoose.Schema(
  {
    reps: { type: Number, min: 0, max: 1000, default: 0 },
    weightKg: { type: Number, min: 0, max: 2000, default: 0 }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    exercise: { type: String, required: true },
    activityType: {
      type: String,
      enum: ["gym", "running", "walking", "cycling", "yoga", "sports", "other"],
      default: "gym",
      index: true
    },
    muscleGroup: {
      type: String,
      enum: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio", "Mobility", "Other"],
      default: "Full Body"
    },
    reps: { type: Number, default: 0 },
    sets: { type: Number, default: 1 },
    weightLiftedKg: { type: Number, default: 0, min: 0 },
    totalVolumeKg: { type: Number, default: 0, min: 0 },
    setDetails: { type: [setDetailSchema], default: [] },
    duration: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0, min: 0 },
    calories: { type: Number, default: 0 },
    difficulty: { type: String, default: "Beginner" },
    intensity: { type: String, enum: ["Light", "Moderate", "Hard"], default: "Moderate" },
    perceivedEffort: { type: Number, min: 1, max: 10, default: 5 },
    startedAt: { type: Date },
    endedAt: { type: Date },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

workoutSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Workout", workoutSchema);
