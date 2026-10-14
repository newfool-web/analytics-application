import mongoose from 'mongoose';
import env from './env.js';

export async function connectDB(uri = env.MONGODB_URI) {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`MongoDB disconnection error: ${error.message}`);
  }
}

export default {
  connectDB,
  disconnectDB
};
