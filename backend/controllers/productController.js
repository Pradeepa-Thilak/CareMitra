const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    let filter = { isActive: true };
    
    // CATEGORY FILTER
    if (category) {
      const categoryDoc = await Category.findOne({ key: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          pagination: {},
          data: []
        });
      }
    }

    // BRAND FILTER - NEW LOGIC
    if (brand) {
      const brandDoc = await Brand.findOne({ key: brand });
      if (brandDoc) {
        filter.brand = brandDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          pagination: {},
          data: []
        });
      }
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.discountedPrice = {};
      if (minPrice) filter.discountedPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.discountedPrice.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with population
    const products = await Product.find(filter)
      .populate('category', 'name key image description')
      .populate('brand', 'name key image description')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name key image description')
      .populate('brand', 'name key image description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// NEW: Get products by brand and category combination
const getProductsByBrandAndCategory = async (req, res) => {
  try {
    const { brand, category } = req.query;

    if (!brand || !category) {
      return res.status(400).json({
        success: false,
        message: 'Both brand and category parameters are required'
      });
    }

    const brandDoc = await Brand.findOne({ key: brand });
    const categoryDoc = await Category.findOne({ key: category });
    console.log(brandDoc._id);
    console.log(categoryDoc._id);
    
    

    // if (!brandDoc || !categoryDoc) {
    //   return res.status(200).json({
    //     success: true,
    //     count: 0,
    //     data: []
    //   });
    // }

    const products = await Product.find({
      brand: brandDoc._id,
      category: categoryDoc._id,
      isActive: true
    })
    // .populate('category', 'name key image description')
    // .populate('brand', 'name key image description');

    console.log(products);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};



module.exports = {
  getProducts,
  getProductById,
  getProductsByBrandAndCategory
};