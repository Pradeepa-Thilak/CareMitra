const express = require('express');
const router = express.Router();
const labTestController = require('../controllers/labTestController');
const admin = require('../middleware/admin');
const { reportUpload } = require('../middleware/fileUpload');

// Admin routes
router.put('/order/:id/sample-status', admin, labTestController.updateSampleStatus);
router.put('/order/:id/processing', admin, labTestController.updateProcessingStatus);
router.put('/order/:id/upload-report', admin, reportUpload.single('report'), labTestController.uploadReport);
router.get('/prescription/:razorpayOrderId', admin , labTestController.getPrescription);
router.post('/create-test', admin ,labTestController.createTest);
router.put('/changeActive/:id' , admin,labTestController.changeActive);
router.delete('/delete-test/:id' ,admin , labTestController.deleteTest);
router.put('/edit-test/:id' , admin ,labTestController.editProfile);
router.get('/lab-orders' , admin , labTestController.getAllLabTestOrders);
module.exports = router;