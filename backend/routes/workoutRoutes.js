const express = require("express");
const {
  createWorkout,
  getWorkouts,
  getAnalytics,
  deleteWorkout,
  getMonthlyReport,
  getTrainingPlan,
  saveTrainingPlan
} = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/workout", protect, createWorkout);
router.get("/workouts", protect, getWorkouts);
router.get("/workouts/analytics", protect, getAnalytics);
router.delete("/workouts/:id", protect, deleteWorkout);
router.get("/reports/monthly", protect, getMonthlyReport);
router.get("/training-plan", protect, getTrainingPlan);
router.put("/training-plan", protect, saveTrainingPlan);

module.exports = router;
