const Workout = require("../models/Workout");
const User = require("../models/User");
const TrainingPlan = require("../models/TrainingPlan");
const mongoose = require("mongoose");
const { calculateCalories } = require("../utils/calories");

const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const activityTypes = ["gym", "running", "walking", "cycling", "yoga", "sports", "other"];
const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio", "Mobility", "Other"];
const defaultDays = [
  { day: "Monday", focus: "Chest + Triceps", exercises: ["Bench Press", "Incline Press", "Tricep Pushdown"], targetMinutes: 60 },
  { day: "Tuesday", focus: "Back + Biceps", exercises: ["Lat Pulldown", "Cable Row", "Bicep Curl"], targetMinutes: 60 },
  { day: "Wednesday", focus: "Running + Core", exercises: ["Easy Run", "Plank", "Leg Raises"], targetMinutes: 45 },
  { day: "Thursday", focus: "Legs", exercises: ["Squats", "Lunges", "Calf Raises"], targetMinutes: 60 },
  { day: "Friday", focus: "Shoulders + Arms", exercises: ["Shoulder Press", "Lateral Raise", "Hammer Curl"], targetMinutes: 50 },
  { day: "Saturday", focus: "Long Run / Sports", exercises: ["Running", "Mobility"], targetMinutes: 45 },
  { day: "Sunday", focus: "Recovery", exercises: ["Walking", "Stretching"], targetMinutes: 20, isRestDay: true }
];

const safeNumber = (value, fallback = 0, max = 100000) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), max) : fallback;
};

const updateStreakAndAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const today = normalizeDate(now);
  const last = user.lastWorkoutDate ? normalizeDate(new Date(user.lastWorkoutDate)) : null;

  if (!last) {
    user.streak = 1;
  } else {
    const daysDiff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) user.streak += 1;
    if (daysDiff > 1) user.streak = 1;
  }

  user.lastWorkoutDate = now;

  const workoutCount = await Workout.countDocuments({ userId });
  const pushupCount = await Workout.aggregate([
    { $match: { userId: user._id, exercise: "Pushups" } },
    { $group: { _id: null, total: { $sum: "$reps" } } }
  ]);

  const totalPushups = pushupCount[0]?.total || 0;

  const achievementSet = new Set(user.achievements);
  if (workoutCount >= 1) achievementSet.add("First Workout");
  if (workoutCount >= 20) achievementSet.add("Consistency Pro");
  if (totalPushups >= 100) achievementSet.add("100 Pushups");
  if (user.streak >= 7) achievementSet.add("7 Day Streak");

  user.achievements = Array.from(achievementSet);
  await user.save();
};

const createWorkout = async (req, res, next) => {
  try {
    const {
      exercise,
      activityType = "gym",
      muscleGroup = "Full Body",
      reps = 0,
      sets = 1,
      weightLiftedKg = 0,
      setDetails = [],
      duration = 0,
      distanceKm = 0,
      calories,
      date,
      difficulty,
      intensity = "Moderate",
      perceivedEffort = 5,
      startedAt,
      endedAt,
      notes = ""
    } = req.body;

    if (!exercise) {
      return res.status(400).json({ message: "Exercise is required." });
    }

    if (!activityTypes.includes(activityType) || !muscleGroups.includes(muscleGroup)) {
      return res.status(400).json({ message: "Invalid activity type or muscle group." });
    }

    const startDate = startedAt ? new Date(startedAt) : null;
    const endDate = endedAt ? new Date(endedAt) : null;
    if ((startDate && Number.isNaN(startDate.getTime())) || (endDate && Number.isNaN(endDate.getTime()))) {
      return res.status(400).json({ message: "Invalid activity start or finish time." });
    }
    if (startDate && endDate && endDate <= startDate) {
      return res.status(400).json({ message: "Finish time must be after start time." });
    }
    const timedDuration = startDate && endDate ? Math.round((endDate - startDate) / 60000) : null;
    if (timedDuration && timedDuration > 1440) {
      return res.status(400).json({ message: "An activity cannot be longer than 24 hours." });
    }
    const durationMinutes = timedDuration ?? safeNumber(duration, 0, 1440);
    const normalizedSetDetails = Array.isArray(setDetails)
      ? setDetails.slice(0, 30).map((item) => ({
        reps: safeNumber(item.reps, 0, 1000),
        weightKg: safeNumber(item.weightKg, 0, 2000)
      }))
      : [];
    const normalizedSets = normalizedSetDetails.length || safeNumber(sets, 1, 1000);
    const normalizedReps = safeNumber(reps, 0, 100000);
    const normalizedWeight = normalizedSetDetails.length
      ? Math.max(...normalizedSetDetails.map((item) => item.weightKg), 0)
      : safeNumber(weightLiftedKg, 0, 2000);
    const totalVolumeKg = normalizedSetDetails.length
      ? normalizedSetDetails.reduce((sum, item) => sum + item.reps * item.weightKg, 0)
      : normalizedWeight * normalizedSets * normalizedReps;
    const user = await User.findById(req.user.id).select("weight");
    const computedCalories = calories ?? calculateCalories({
      exercise,
      activityType,
      durationMinutes: durationMinutes || 1,
      weightKg: user?.weight || 70
    });

    const workout = await Workout.create({
      userId: req.user.id,
      exercise: String(exercise).trim().slice(0, 80),
      activityType,
      muscleGroup,
      reps: normalizedReps,
      sets: normalizedSets,
      weightLiftedKg: normalizedWeight,
      totalVolumeKg: Number(totalVolumeKg.toFixed(2)),
      setDetails: normalizedSetDetails,
      duration: durationMinutes,
      distanceKm: safeNumber(distanceKm, 0, 1000),
      calories: safeNumber(computedCalories, 0, 100000),
      difficulty: difficulty || "Beginner",
      intensity: ["Light", "Moderate", "Hard"].includes(intensity) ? intensity : "Moderate",
      perceivedEffort: Math.min(Math.max(safeNumber(perceivedEffort, 5, 10), 1), 10),
      startedAt: startDate || undefined,
      endedAt: endDate || undefined,
      date: startDate || (date ? new Date(date) : new Date()),
      notes: String(notes || "").trim().slice(0, 500)
    });

    await updateStreakAndAchievements(req.user.id);

    return res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
};

const deleteWorkout = async (req, res, next) => {
  try {
    const deleted = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Activity not found." });
    return res.json({ message: "Activity deleted." });
  } catch (error) {
    next(error);
  }
};

const getWorkouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    const query = { userId: req.user.id };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Workout.countDocuments(query);

    return res.json({
      page: Number(page),
      total,
      pages: Math.ceil(total / Number(limit)),
      workouts
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const monthly = await Workout.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          calories: { $sum: "$calories" },
          duration: { $sum: "$duration" },
          reps: { $sum: "$reps" },
          workouts: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const byExercise = await Workout.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$exercise",
          count: { $sum: 1 },
          calories: { $sum: "$calories" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.json({ monthly, byExercise });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const monthValue = /^\d{4}-\d{2}$/.test(req.query.month || "")
      ? req.query.month
      : new Date().toISOString().slice(0, 7);
    const [year, month] = monthValue.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const match = { userId: userObjectId, date: { $gte: start, $lt: end } };

    const [summaryRows, byType, byMuscle, daily, personalBest] = await Promise.all([
      Workout.aggregate([
        { $match: match },
        { $group: {
          _id: null,
          activities: { $sum: 1 },
          totalMinutes: { $sum: "$duration" },
          calories: { $sum: "$calories" },
          distanceKm: { $sum: "$distanceKm" },
          totalSets: { $sum: "$sets" },
          totalReps: { $sum: "$reps" },
          activeDays: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }
        } }
      ]),
      Workout.aggregate([
        { $match: match },
        { $group: { _id: "$activityType", minutes: { $sum: "$duration" }, distanceKm: { $sum: "$distanceKm" }, count: { $sum: 1 } } },
        { $sort: { minutes: -1 } }
      ]),
      Workout.aggregate([
        { $match: { ...match, activityType: "gym" } },
        { $group: { _id: "$muscleGroup", sessions: { $sum: 1 }, sets: { $sum: "$sets" } } },
        { $sort: { sets: -1 } }
      ]),
      Workout.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, minutes: { $sum: "$duration" }, distanceKm: { $sum: "$distanceKm" }, calories: { $sum: "$calories" } } },
        { $sort: { _id: 1 } }
      ]),
      Workout.findOne(match).sort({ distanceKm: -1 }).select("exercise distanceKm duration date").lean()
    ]);

    const row = summaryRows[0] || {};
    const daysInMonth = new Date(year, month, 0).getDate();
    const elapsedDays = monthValue === new Date().toISOString().slice(0, 7) ? new Date().getDate() : daysInMonth;
    const summary = {
      activities: row.activities || 0,
      totalMinutes: Math.round(row.totalMinutes || 0),
      gymHours: Number(((byType.find((x) => x._id === "gym")?.minutes || 0) / 60).toFixed(1)),
      runningHours: Number(((byType.find((x) => x._id === "running")?.minutes || 0) / 60).toFixed(1)),
      distanceKm: Number((row.distanceKm || 0).toFixed(2)),
      calories: Math.round(row.calories || 0),
      totalSets: row.totalSets || 0,
      totalReps: row.totalReps || 0,
      activeDays: row.activeDays?.length || 0,
      consistencyPercent: Math.round(((row.activeDays?.length || 0) / Math.max(elapsedDays, 1)) * 100)
    };

    return res.json({ month: monthValue, summary, byType, byMuscle, daily, personalBest });
  } catch (error) {
    next(error);
  }
};

const getTrainingPlan = async (req, res, next) => {
  try {
    const plan = await TrainingPlan.findOneAndUpdate(
      { userId: req.user.id },
      { $setOnInsert: { days: defaultDays, dailyRunGoalKm: 5, weeklyActivityGoalMinutes: 150 } },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json(plan);
  } catch (error) {
    next(error);
  }
};

const saveTrainingPlan = async (req, res, next) => {
  try {
    const days = Array.isArray(req.body.days) ? req.body.days.slice(0, 7) : undefined;
    if (!days?.length) return res.status(400).json({ message: "At least one plan day is required." });
    const plan = await TrainingPlan.findOneAndUpdate(
      { userId: req.user.id },
      {
        days: days.map((item) => ({
          day: item.day,
          focus: String(item.focus || "Recovery").trim().slice(0, 60),
          exercises: Array.isArray(item.exercises) ? item.exercises.slice(0, 10).map((x) => String(x).trim().slice(0, 60)).filter(Boolean) : [],
          targetMinutes: safeNumber(item.targetMinutes, 0, 300),
          isRestDay: Boolean(item.isRestDay)
        })),
        dailyRunGoalKm: safeNumber(req.body.dailyRunGoalKm, 5, 100),
        weeklyActivityGoalMinutes: safeNumber(req.body.weeklyActivityGoalMinutes, 150, 3000)
      },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json(plan);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getAnalytics,
  deleteWorkout,
  getMonthlyReport,
  getTrainingPlan,
  saveTrainingPlan
};
