const express = require("express");
const router = express.Router();
const { registerAdmin, adminLogin } = require("../controllers/adminAuthController");
// const adminAuth = require('../middleware/admin');

router.post("/register", registerAdmin);
router.post("/login" ,adminLogin);
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

module.exports = router;
