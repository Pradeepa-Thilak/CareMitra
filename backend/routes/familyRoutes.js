const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(authMiddleware);

// Family member routes
router.post('/add', familyController.addFamilyMember);
router.get('/members', familyController.getFamilyMembers);
router.get('/members/:memberId', familyController.getMemberWithStats);
router.put('/members/:memberId', familyController.updateFamilyMember);
router.delete('/members/:memberId', familyController.deleteFamilyMember);

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