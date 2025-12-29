const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getCategories,
  getBrands
} = require("../controllers/adminProduct.controller");

const admin = require("../middleware/admin");

// Admin Product APIs
router.post("/products", admin, addProduct);
router.get("/products", admin, getProducts);
router.put("/products/:id", admin, updateProduct);
router.delete("/products/:id", admin, deleteProduct);
router.patch("/products/:id/status", admin, toggleProductStatus);
router.get('/categories' ,admin , getCategories);
router.get('/brands',admin , getBrands);
module.exports = router;
