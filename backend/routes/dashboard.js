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
selectSpecialist,checkPaymentStatus,
createorder,
consultingType,
deleteMember,
updateMember,
getMemberById} = require("../controllers/patientController");


router.use(auth);


router.get("/viewProfile", auth ,viewProfile);


router.post("/editProfile", auth ,editProfile);

router.get("/doctorAll",auth ,getAllDoctor);

router.get("/myAppointments", auth ,myAppointment);

router.post("/addMember" , auth ,addMember);

router.get("/getMember" , auth ,getMember);

router.post("/symptoms" ,auth ,addSymptoms);

router.post("/specialists" , auth ,selectSpecialist);
router.put("/type/:id" , auth ,consultingType);
router.post('/create-order', auth ,createorder);
router.post('/verify-payment', auth ,verifyPayment);
router.get('/payment-status',auth,  checkPaymentStatus);
router.delete('/delete/:id' ,auth, deleteMember);
router.get('/:memberId' , auth ,getMemberById);
router.put('/edit/:id', auth ,updateMember);
// router.post("/bookAppointment", bookAppointment);

module.exports = router;