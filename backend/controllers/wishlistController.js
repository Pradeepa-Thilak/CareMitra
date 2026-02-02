// controllers/wishlistController.js
const mongoose = require('mongoose');
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// GET WISHLIST
exports.getWishlist = async (req, res) => {
  try {
    const patientId = req.user.userId;
    console.log(patientId);
    if (!patientId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Convert patientId to ObjectId
    let objectIdPatientId;
    try {
      objectIdPatientId = new mongoose.Types.ObjectId(patientId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const wishlist = await Wishlist.findOne({ patientId: objectIdPatientId });

    if (!wishlist) {
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: wishlist.items });

  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  try {
    const patientId = req.user.userId;
   console.log(patientId);
   
    if (!patientId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Convert patientId to ObjectId
    // let objectIdPatientId;
    // try {
    //   objectIdPatientId = new mongoose.Types.ObjectId(patientId);
    // } catch (error) {
    //   return res.status(400).json({ message: "Invalid user ID format" });
    // }

    const { productId, name, price, discountedPrice, image, packSize, category } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    let wishlist = await Wishlist.findOne({ patientId });

    // Check if product already exists in wishlist
    if (wishlist) {
      const existingItem = wishlist.items.find(
        (item) => item.productId.toString() === productId.toString()
      );

      if (existingItem) {
        return res.status(400).json({ 
          success: false, 
          message: "Product already in wishlist" 
        });
      }
    }

    // Create new item
    const newItem = {
      productId,
      name: name || product.name,
      price: price || product.price,
      discountedPrice: discountedPrice || product.discountedPrice || null,
      image: image || product.image || product.imageUrl || null,
      packSize: packSize || product.packSize || null,
      category: category || product.category || null
    };

    if (!wishlist) {
      // Create new wishlist
      wishlist = await Wishlist.create({
        patientId,
        items: [newItem]
      });
    } else {
      // Add to existing wishlist
      wishlist.items.push(newItem);
      await wishlist.save();
    }

    // Get the newly added item with its generated _id
    const addedItem = wishlist.items[wishlist.items.length - 1];
    
    res.json({ 
      success: true, 
      data: addedItem 
    });

  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const itemId = req.params.itemId;

    if (!patientId || !itemId) {
      return res.status(400).json({ message: "User ID and Item ID are required" });
    }

    // Convert patientId to ObjectId
   

    const wishlist = await Wishlist.findOne({ patientId});
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist Not Found" });
    }

    // Find item by its _id
    const itemIndex = wishlist.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    // Remove the item
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.json({ 
      success: true, 
      message: "Item removed from wishlist",
      removedItemId: itemId
    });

  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res.status(500).json({ message: err.message });
  }
};

// CLEAR WISHLIST
exports.clearWishlist = async (req, res) => {
  try {
    const patientId = req.user.userId;

    if (!patientId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const wishlist = await Wishlist.findOne({ patientId});
    if (!wishlist) {
      return res.json({ success: true, message: "Wishlist is already empty" });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ success: true, message: "Wishlist cleared" });

  } catch (err) {
    console.error("Clear wishlist error:", err);
    res.status(500).json({ message: err.message });
  }
};