const axios = require("axios");
const Workout = require("../models/Workout");

const fallbackRecommend = (user = {}, history = []) => {
  const goal = user.goal || "Beginner";
  const level = user.fitnessLevel || "Beginner";

  const base = {
    "Weight Loss": [
      { exercise: "Jumping Jacks", sets: 4, reps: 30, rest: 30 },
      { exercise: "Squats", sets: 4, reps: 20, rest: 45 },
      { exercise: "Plank", sets: 3, reps: 60, rest: 30 }
    ],
    "Muscle Gain": [
      { exercise: "Pushups", sets: 4, reps: 15, rest: 60 },
      { exercise: "Lunges", sets: 4, reps: 16, rest: 60 },
      { exercise: "Plank", sets: 4, reps: 75, rest: 45 }
    ],
    Strength: [
      { exercise: "Pushups", sets: 5, reps: 12, rest: 75 },
      { exercise: "Squats", sets: 5, reps: 15, rest: 75 },
      { exercise: "Lunges", sets: 4, reps: 14, rest: 60 }
    ],
    Beginner: [
      { exercise: "Pushups", sets: 3, reps: 8, rest: 60 },
      { exercise: "Squats", sets: 3, reps: 10, rest: 60 },
      { exercise: "Plank", sets: 3, reps: 30, rest: 45 }
    ],
    Advanced: [
      { exercise: "Pushups", sets: 6, reps: 20, rest: 60 },
      { exercise: "Squats", sets: 6, reps: 25, rest: 60 },
      { exercise: "Lunges", sets: 5, reps: 20, rest: 45 }
    ]
  };

  const plan = (base[goal] || base.Beginner).map((item) => ({ ...item }));

  if (history.length >= 5 || level === "Advanced") {
    plan.forEach((item) => {
      item.reps = Math.round(item.reps * 1.1);
      item.sets += 1;
    });
  }

  return {
    difficulty: history.length > 15 ? "Intermediate+" : level,
    recommendation: plan,
    note: "Smart recommendation generated from goal and workout history."
  };
};

const recommendWorkout = async (req, res, next) => {
  try {
    const history = await Workout.find({ userId: req.user.id }).sort({ date: -1 }).limit(20);
    const userProfile = req.body.user || {};

    if (process.env.PY_AI_URL) {
      try {
        const aiResponse = await axios.post(`${process.env.PY_AI_URL}/recommend`, {
          user: userProfile,
          history
        }, { timeout: 4000 });
        return res.json(aiResponse.data);
      } catch (error) {
        console.warn("Python AI server unavailable, fallback used.");
      }
    }

    return res.json(fallbackRecommend(userProfile, history));
  } catch (error) {
    next(error);
  }
};

const chatbot = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (process.env.PY_AI_URL) {
      try {
        const aiResponse = await axios.post(`${process.env.PY_AI_URL}/chat`, { message }, { timeout: 4000 });
        return res.json(aiResponse.data);
      } catch (error) {
        console.warn("Python AI chat unavailable, local fallback used.");
      }
    }

    const normalized = (message || "").toLowerCase();

    let reply = "Focus on consistency: 4 sessions per week with progressive overload.";
    if (normalized.includes("weight loss")) {
      reply = "Prioritize circuit training, 30-40 minutes, 4x/week, and maintain a slight calorie deficit.";
    } else if (normalized.includes("muscle")) {
      reply = "Use higher resistance and 8-12 rep ranges. Track protein intake and increase load weekly.";
    } else if (normalized.includes("beginner")) {
      reply = "Start with full-body sessions 3x/week. Use bodyweight basics and build technique first.";
    } else if (normalized.includes("plank") || normalized.includes("posture")) {
      reply = "For better plank posture: keep hips aligned with shoulders and brace your core throughout each set.";
    }

    return res.json({ reply });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recommendWorkout,
  chatbot
};
