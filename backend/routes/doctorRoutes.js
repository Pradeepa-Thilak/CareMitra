const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const premiumController = require('../controllers/premiumController');
const auth = require('../middleware/auth');
// Doctor registration
// router.post('/register', registerDoctor);

router.post('/register', doctorController.registerDoctor);
router.get('/:doctorId/premium-info', auth ,doctorController.getDoctorForPremium);
router.post('/select-plan', auth ,premiumController.selectPremiumPlan);

module.exports = router;