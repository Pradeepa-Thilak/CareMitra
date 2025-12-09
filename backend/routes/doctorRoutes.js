const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const premiumController = require('../controllers/premiumController');

// Doctor registration
// router.post('/register', registerDoctor);

router.post('/register', doctorController.registerDoctor);
router.get('/:doctorId/premium-info', doctorController.getDoctorForPremium);
router.post('/:doctorId/select-plan', premiumController.selectPremiumPlan);

module.exports = router;