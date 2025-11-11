const Category = require('../models/Category');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .select('name key image description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

const getCategoryByKey = async (req, res) => {
  try {
    const category = await Category.findOne({ key: req.params.key });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryByKey
};