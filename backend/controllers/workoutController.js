const Workout = require("../models/Workout");
const User = require("../models/User");
const mongoose = require("mongoose");
const { calculateCalories } = require("../utils/calories");

const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

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
    const { exercise, reps = 0, sets = 1, duration = 0, calories, date, difficulty, notes } = req.body;

    if (!exercise) {
      return res.status(400).json({ message: "Exercise is required." });
    }

    const user = await User.findById(req.user.id).select("weight");
    const computedCalories = calories ?? calculateCalories({
      exercise,
      durationMinutes: duration || 1,
      weightKg: user?.weight || 70
    });

    const workout = await Workout.create({
      userId: req.user.id,
      exercise,
      reps,
      sets,
      duration,
      calories: computedCalories,
      difficulty: difficulty || "Beginner",
      date: date ? new Date(date) : new Date(),
      notes
    });

    await updateStreakAndAchievements(req.user.id);

    return res.status(201).json(workout);
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

module.exports = {
  createWorkout,
  getWorkouts,
  getAnalytics
};
