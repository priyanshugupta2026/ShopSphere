require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const sampleProducts = require('../data/seedData');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Inserting sample products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} products!`);

    // Create a demo user if doesn't exist
    const demoEmail = 'alex@example.com';
    const userExists = await User.findOne({ email: demoEmail });
    if (!userExists) {
      await User.create({
        name: 'Alex Johnson',
        email: demoEmail,
        password: 'password123',
        role: 'user'
      });
      console.log('Demo user created (Email: alex@example.com, Password: password123)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
