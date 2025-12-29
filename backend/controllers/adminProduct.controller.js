const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");

/**
 * POST /admin/products
 * Add Product
 */
exports.addProduct = async (req, res) => {
  try {
    const { brand, category, ...rest } = req.body;

    const brandDoc = await Brand.findOne({ name: brand });
    const categoryDoc = await Category.findOne({ name: category });

    if (!brandDoc || !categoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand or category"
      });
    }

    const product = new Product({
      ...rest,
      brand: brandDoc._id,
      category: categoryDoc._id
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Product creation failed",
      error: error.message
    });
  }
};

/**
 * GET /admin/products
 * List Products
 */
exports.getProducts = async (req, res) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const products = await Product.find(filter)
      .populate("brand category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};


/**
 * PUT /admin/products/:id
 * Update Product
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, req.body);
    await product.save(); // ES auto-update via post-save

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Product update failed",
      error: error.message
    });
  }
};

/**
 * DELETE /admin/products/:id
 * Soft Delete Product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deleted (soft delete)"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message
    });
  }
};

/**
 * PATCH /admin/products/:id/status
 * Enable / Disable Product
 */
exports.toggleProductStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: `Product ${isActive ? "enabled" : "disabled"} successfully`,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Status update failed",
      error: error.message
    });
  }
};

exports.getCategories = async (req , res) => {
  try{
    
    const categories = await Category.find().populate("name key");

    if(!categories)
       return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      success: true,
      message: `Categories successfully`,
      data: categories
    });

  }catch(error){
    res.status(400).json({
      success: false,
      message: "Status update failed",
      error: error.message
    });
  }

}

exports.getBrands = async (req,res) =>{
  try{
    let brands = await Brand.find().populate("name key");

    if(!brands){
     return res.status(404).json({ message: "brands not found" });
    }

     res.status(200).json({
      success: true,
      message: `Brands successfully`,
      data: brands
    });


  }catch(error){
    res.status(400).json({
      success: false,
      message: "Status update failed",
      error: error.message
    });
  }
}