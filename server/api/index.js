import app from '../src/app.js';
import mongoose from 'mongoose';

let connectionPromise;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }

    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000
    });
  }

  await connectionPromise;
}

export default async function handler(req, res) {
  await connectDatabase();
  return app(req, res);
}
