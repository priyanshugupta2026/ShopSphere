const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = 'Cash on Delivery'
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required shipping address fields'
      });
    }

    // Verify products exist and stock is sufficient, recalculate prices securely on server
    const verifiedItems = [];
    let calculatedItemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.qty;
      calculatedItemsPrice += itemTotal;

      verifiedItems.push({
        product: product._id,
        name: product.name,
        qty: item.qty,
        price: product.price,
        image: product.image
      });

      // Decrement stock
      product.stock -= item.qty;
      await product.save();
    }

    // Shipping rules: Free shipping over $75, otherwise $9.99
    const shippingPrice = calculatedItemsPrice >= 75 ? 0 : 9.99;
    // Estimated tax: 8%
    const taxPrice = Number((calculatedItemsPrice * 0.08).toFixed(2));
    const totalPrice = Number((calculatedItemsPrice + shippingPrice + taxPrice).toFixed(2));

    const order = new Order({
      user: req.user._id,
      orderItems: verifiedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: Number(calculatedItemsPrice.toFixed(2)),
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false, // For COD, paid upon delivery
      status: 'Processing'
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      data: createdOrder,
      message: 'Order placed successfully! Cash on delivery selected.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is owner of the order or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
