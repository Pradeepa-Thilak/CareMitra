const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require("../controllers/wishlistController");

// Get wishlist
router.get("/", auth ,getWishlist);

// Add to wishlist
router.post("/", auth ,addToWishlist);

// Remove from wishlist
router.delete("/:itemId", auth ,removeFromWishlist);

// Clear wishlist
router.delete("/", auth ,clearWishlist);

module.exports = router;