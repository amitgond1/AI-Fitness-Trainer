const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Workout = require("../models/Workout");

const pickDefinedFields = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = pickDefinedFields(req.body, ["name", "age", "height", "weight", "goal", "fitnessLevel"]);
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No profile fields provided." });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: "-password"
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required." });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await Workout.deleteMany({ userId: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    return res.json({ message: "Account deleted." });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("streak achievements weight");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const workouts = await Workout.find({ userId: req.user.id }).sort({ date: -1 }).limit(30);

    const totalCalories = workouts.reduce((sum, w) => sum + Number(w.calories || 0), 0);
    const totalDuration = workouts.reduce((sum, w) => sum + Number(w.duration || 0), 0);

    return res.json({
      streak: user.streak,
      achievements: user.achievements,
      totalCalories,
      totalDuration,
      recentWorkouts: workouts
    });
  } catch (error) {
    next(error);
  }
};

const getAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("achievements streak");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ achievements: user.achievements, streak: user.streak });
  } catch (error) {
    next(error);
  }
};

const upsertReminder = async (req, res, next) => {
  try {
    const { title, time, enabled = true } = req.body;
    if (!time) {
      return res.status(400).json({ message: "Reminder time is required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingIndex = user.reminders.findIndex((item) => item.time === time);

    if (existingIndex >= 0) {
      user.reminders[existingIndex] = { title: title || "Workout Reminder", time, enabled };
    } else {
      user.reminders.push({ title: title || "Workout Reminder", time, enabled });
    }

    await user.save();
    return res.json({ reminders: user.reminders });
  } catch (error) {
    next(error);
  }
};

const getReminders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("reminders");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ reminders: user.reminders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getStats,
  getAchievements,
  upsertReminder,
  getReminders
};
