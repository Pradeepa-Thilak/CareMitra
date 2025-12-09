const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');
const {doctorAppointment,
      changeStatus,
      reschedule,
      registerDoctor
} = require("../controllers/doctorController");




const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ success: false, message: `Access denied. ${role}s only.` });
  }
  next();
};


router.post("/register/doctor" , registerDoctor);


router.get("/appointments", auth , requireRole("doctor"), doctorAppointment);


router.patch("/appointment/:patientId/status", auth ,requireRole("doctor") , changeStatus);


router.patch("/appointment/:patientId/reschedule",auth, requireRole("doctor"), reschedule);

module.exports = router;