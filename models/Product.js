const mongoose = require('mongoose');
const { dbStatus } = require('../config/db');
const { MockProduct } = require('../config/memoryStore');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide product description']
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      default: null
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
      index: true
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock count'],
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    numReviews: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      required: [true, 'Please provide product image URL']
    },
    features: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const MongooseProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

// Dynamic proxy that routes to Mongoose model if connected, or MockProduct if in memory mode
const Product = new Proxy(MongooseProduct, {
  get(target, prop) {
    if (dbStatus.isMongooseConnected) {
      return target[prop];
    }
    if (prop in MockProduct) {
      return MockProduct[prop];
    }
    return target[prop];
  }
});

module.exports = Product;
