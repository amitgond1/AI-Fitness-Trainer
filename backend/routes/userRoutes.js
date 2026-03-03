const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getStats,
  getAchievements,
  upsertReminder,
  getReminders
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);
router.get("/stats", protect, getStats);
router.get("/achievements", protect, getAchievements);
router.get("/reminders", protect, getReminders);
router.post("/reminders", protect, upsertReminder);

module.exports = router;
