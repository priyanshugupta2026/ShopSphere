require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const sampleProducts = require('./data/seedData');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Frontend Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ShopSphere API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Custom 404 & Error Handlers for API
app.use('/api/*', notFound);
app.use(errorHandler);

// SPA fallback for HTML pages if needed
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auto-seed function when DB is ready
const initializeDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database has no products. Auto-seeding initial catalog...');
      await Product.insertMany(sampleProducts);
      console.log(`Auto-seeded ${sampleProducts.length} sample products successfully!`);

      // Seed demo user
      const demoEmail = 'alex@example.com';
      const userExists = await User.findOne({ email: demoEmail });
      if (!userExists) {
        await User.create({
          name: 'Alex Johnson',
          email: demoEmail,
          password: 'password123',
          role: 'user'
        });
        console.log('Created demo user: alex@example.com / password123');
      }
    } else {
      console.log(`Database already populated with ${productCount} products.`);
    }
  } catch (err) {
    console.error('Error during initial catalog check/seeding:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` ShopSphere E-Commerce Server is running!`);
      console.log(` Local URL: http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
