const express = require("express");
const { recommendWorkout, chatbot } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/recommend", protect, recommendWorkout);
router.post("/chatbot", protect, chatbot);

module.exports = router;
