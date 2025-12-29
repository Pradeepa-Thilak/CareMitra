const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/admin");
const controller = require("../controllers/adminConsultationController");

router.get("/consultations", adminAuth, controller.getAllConsultations);
router.patch(
  "/consultations/:id/status",
  adminAuth,
  controller.updateConsultationStatus
);

module.exports = router;
