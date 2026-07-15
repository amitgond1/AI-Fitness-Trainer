const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    focus: { type: String, required: true, trim: true, maxlength: 60 },
    exercises: { type: [String], default: [] },
    targetMinutes: { type: Number, default: 45, min: 0, max: 300 },
    isRestDay: { type: Boolean, default: false }
  },
  { _id: false }
);

const trainingPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    dailyRunGoalKm: { type: Number, default: 5, min: 0, max: 100 },
    weeklyActivityGoalMinutes: { type: Number, default: 150, min: 0, max: 3000 },
    days: { type: [daySchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingPlan", trainingPlanSchema);
