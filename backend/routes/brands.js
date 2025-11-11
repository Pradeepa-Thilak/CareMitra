const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandByKey,
  getFeaturedBrands
} = require('../controllers/brandController');

router.get('/', getBrands);
router.get('/featured', getFeaturedBrands);
router.get('/:key', getBrandByKey);

module.exports = router;