const express = require("express");
const { createWorkout, getWorkouts, getAnalytics } = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/workout", protect, createWorkout);
router.get("/workouts", protect, getWorkouts);
router.get("/workouts/analytics", protect, getAnalytics);

module.exports = router;
