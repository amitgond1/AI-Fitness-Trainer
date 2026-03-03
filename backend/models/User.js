const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const reminderSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Workout Reminder" },
    time: { type: String, required: true },
    enabled: { type: Boolean, default: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    age: { type: Number, default: 25 },
    height: { type: Number, default: 170 },
    weight: { type: Number, default: 70 },
    goal: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Strength", "Beginner", "Advanced"],
      default: "Beginner"
    },
    fitnessLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    streak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date },
    achievements: {
      type: [String],
      default: ["First Login"]
    },
    reminders: {
      type: [reminderSchema],
      default: [{ title: "Daily Workout", time: "18:00", enabled: true }]
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
