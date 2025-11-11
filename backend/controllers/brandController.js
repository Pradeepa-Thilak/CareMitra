const Brand = require('../models/Brand');

const getBrands = async (req, res) => {
  try {
    const { featured } = req.query;
    
    let filter = {};
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const brands = await Brand.find(filter)
      .select('name key image description isFeatured')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
};

const getBrandByKey = async (req, res) => {
  try {
    const brand = await Brand.findOne({ key: req.params.key });
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brand',
      error: error.message
    });
  }
};

const getFeaturedBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isFeatured: true })
      .select('name key image description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured brands',
      error: error.message
    });
  }
};

module.exports = {
  getBrands,
  getBrandByKey,
  getFeaturedBrands
};