const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  syncSteps,
  getTodaySteps,
  getStepsRange,
} = require("../controller/steps_controller");

// All routes are protected (require authentication)
router.post("/sync", protect, syncSteps);
router.get("/today", protect, getTodaySteps);
router.get("/range", protect, getStepsRange);

module.exports = router;
