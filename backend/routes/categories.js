const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryByKey
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:key', getCategoryByKey);

module.exports = router;