const mongoose = require('mongoose');

const dbStatus = {
  get isMongooseConnected() {
    return mongoose.connection.readyState === 1;
  },
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere'
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere';
  dbStatus.uri = uri;

  try {
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (err) {
    await mongoose.disconnect().catch(() => {});
    console.warn(`Standard MongoDB connection to ${uri} failed: ${err.message}`);
    console.log('⚡ Activating Built-in In-Memory Database Mode for instant testing.');
    console.log('   (To use local MongoDB, ensure mongod is running on port 27017, or set MONGODB_URI in .env)');
  }
};

connectDB.connectDB = connectDB;
connectDB.dbStatus = dbStatus;

module.exports = connectDB;
