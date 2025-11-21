const express = require('express');
const router = express.Router();
const  auth  = require('../middleware/auth');
const {viewProfile,
  editProfile,
  getAllDoctor,
  myAppointment} = require("../controllers/patientController");


router.use(auth);


router.get("/viewProfile", viewProfile);


router.post("/editProfile", editProfile);


router.get("/doctorAll",getAllDoctor);

router.get("/myAppointments", myAppointment);

module.exports = router;