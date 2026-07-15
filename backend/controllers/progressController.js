const mongoose = require("mongoose");
const BodyMetric = require("../models/BodyMetric");
const Workout = require("../models/Workout");
const User = require("../models/User");

const numericFields = ["weightKg", "waistCm", "chestCm", "armsCm", "bodyFatPercent", "energy"];

const createMetric = async (req, res, next) => {
  try {
    const payload = { userId: req.user.id };
    numericFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") payload[field] = Number(req.body[field]);
    });
    payload.date = req.body.date ? new Date(req.body.date) : new Date();
    payload.mood = req.body.mood || "Good";
    payload.notes = String(req.body.notes || "").trim().slice(0, 500);
    if (Number.isNaN(payload.date.getTime())) return res.status(400).json({ message: "Invalid measurement date." });
    if (!numericFields.some((field) => payload[field] !== undefined)) return res.status(400).json({ message: "At least one measurement is required." });

    const metric = await BodyMetric.create(payload);
    if (payload.weightKg) await User.findByIdAndUpdate(req.user.id, { weight: payload.weightKg });
    return res.status(201).json(metric);
  } catch (error) {
    next(error);
  }
};

const getMetrics = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 90, 1), 365);
    const metrics = await BodyMetric.find({ userId: req.user.id }).sort({ date: -1 }).limit(limit).lean();
    return res.json({ metrics });
  } catch (error) {
    next(error);
  }
};

const deleteMetric = async (req, res, next) => {
  try {
    const metric = await BodyMetric.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!metric) return res.status(404).json({ message: "Measurement not found." });
    return res.json({ message: "Measurement deleted." });
  } catch (error) {
    next(error);
  }
};

const getProgressOverview = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const [metrics, longestRun, fastestRun, heaviestLift, biggestSession] = await Promise.all([
      BodyMetric.find({ userId }).sort({ date: -1 }).limit(2).lean(),
      Workout.findOne({ userId, activityType: "running" }).sort({ distanceKm: -1 }).select("distanceKm duration date exercise").lean(),
      Workout.aggregate([
        { $match: { userId, activityType: "running", distanceKm: { $gt: 0 }, duration: { $gt: 0 } } },
        { $addFields: { pace: { $divide: ["$duration", "$distanceKm"] } } },
        { $sort: { pace: 1 } },
        { $limit: 1 },
        { $project: { exercise: 1, distanceKm: 1, duration: 1, date: 1, pace: 1 } }
      ]),
      Workout.findOne({ userId, activityType: "gym" }).sort({ weightLiftedKg: -1 }).select("exercise weightLiftedKg reps date").lean(),
      Workout.findOne({ userId, activityType: "gym" }).sort({ totalVolumeKg: -1 }).select("exercise totalVolumeKg date").lean()
    ]);

    const latest = metrics[0] || null;
    const previous = metrics[1] || null;
    const changes = {};
    ["weightKg", "waistCm", "chestCm", "armsCm", "bodyFatPercent"].forEach((field) => {
      if (latest?.[field] != null && previous?.[field] != null) changes[field] = Number((latest[field] - previous[field]).toFixed(2));
    });

    return res.json({
      latest,
      previous,
      changes,
      records: {
        longestRun,
        fastestRun: fastestRun[0] || null,
        heaviestLift,
        biggestSession
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMetric, getMetrics, deleteMetric, getProgressOverview };
