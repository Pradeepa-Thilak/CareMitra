const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByBrandAndCategory
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/by-brand-category', getProductsByBrandAndCategory);
router.get('/:id', getProductById);

module.exports = router;