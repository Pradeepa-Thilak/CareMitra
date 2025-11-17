const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');
const {doctorAppointment,
      changeStatus,
      reschedule
} = require("../controllers/doctorController");

router.use(auth);


const requireDoctor = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ success: false, message: "Access denied. Doctors only." });
  }
  next();
};


router.get("/appointments", requireDoctor, doctorAppointment);


router.patch("/appointment/:patientId/status", requireDoctor, changeStatus);


router.patch("/appointment/:patientId/reschedule", requireDoctor, reschedule);

module.exports = router;