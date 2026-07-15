const express = require("express");
const { createMetric, getMetrics, deleteMetric, getProgressOverview } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/body-metrics", protect, createMetric);
router.get("/body-metrics", protect, getMetrics);
router.delete("/body-metrics/:id", protect, deleteMetric);
router.get("/progress/overview", protect, getProgressOverview);

module.exports = router;
