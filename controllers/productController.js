const Product = require('../models/Product');

// @desc    Fetch all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, featured } = req.query;

    const query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Keyword search across name and description
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by featured flag
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    const products = await Product.find(query).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of unique categories with counts
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: categories.map((c) => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories
};
