const express = require('express');
const router = express.Router();
const  auth  = require('../middleware/auth');
const {viewProfile,
  editProfile,
  getAllDoctor,
  myAppointment,
bookAppointment,
addMember,
getMember,
addSymptoms,
verifyPayment,
selectSpecialist} = require("../controllers/patientController");


router.use(auth);


router.get("/viewProfile", viewProfile);


router.post("/editProfile", editProfile);

router.get("/doctorAll",getAllDoctor);

router.get("/myAppointments", myAppointment);

router.post("/addMember" , addMember);

router.get("/getMember" , getMember);

router.post("/symptoms" ,addSymptoms);

router.post("/specialists" , selectSpecialist);

router.post("/payment" , verifyPayment);

// router.post("/bookAppointment", bookAppointment);

module.exports = router;