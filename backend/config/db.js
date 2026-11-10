const mongoose = require('mongoose');

// MongoDB se connect karo
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taxpal';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Please make sure MongoDB is running or specify a valid MONGODB_URI in backend/.env');
    // app crash mat karo - taaki test aur routes inspect ho sakein
  }
};

module.exports = connectDB;
