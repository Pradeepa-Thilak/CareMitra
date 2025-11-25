const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(auth);

// Family member routes
// ✅ Correct order - specific routes first
router.get('/members/:memberId', familyController.getMemberWithStats); // GET specific member
router.put('/members/:memberId', familyController.updateFamilyMember); // UPDATE member
router.delete('/members/:memberId', familyController.deleteFamilyMember); // DELETE member

// General routes after specific ones
router.post('/add', familyController.addFamilyMember); // ADD member
router.get('/members', familyController.getFamilyMembers); // GET all members

// Health record routes
router.post('/upload-record', 
  uploadMiddleware.single('healthRecord'),
  familyController.uploadHealthRecord
);
router.get('/members/:memberId/records', familyController.getHealthRecords);
router.get('/records/:recordId/download', familyController.downloadHealthRecord);
router.get('/records/:recordId/view', familyController.viewHealthRecord);
router.delete('/records/:recordId', familyController.deleteHealthRecord);

module.exports = router;