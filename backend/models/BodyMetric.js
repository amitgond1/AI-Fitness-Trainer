const mongoose = require("mongoose");

const bodyMetricSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, default: Date.now, required: true },
    weightKg: { type: Number, min: 20, max: 500 },
    waistCm: { type: Number, min: 20, max: 300 },
    chestCm: { type: Number, min: 20, max: 300 },
    armsCm: { type: Number, min: 10, max: 150 },
    bodyFatPercent: { type: Number, min: 1, max: 75 },
    energy: { type: Number, min: 1, max: 10, default: 5 },
    mood: { type: String, enum: ["Low", "Okay", "Good", "Great"], default: "Good" },
    notes: { type: String, trim: true, maxlength: 500, default: "" }
  },
  { timestamps: true }
);

bodyMetricSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("BodyMetric", bodyMetricSchema);
