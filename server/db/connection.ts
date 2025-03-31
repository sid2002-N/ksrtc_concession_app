import mongoose from 'mongoose';
import { log } from '../vite';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ksrtc_concession';
const USE_MONGODB = process.env.USE_MONGODB === 'true';

// Database connection
export async function connectToDB() {
  // Skip MongoDB connection if not using it
  if (!USE_MONGODB) {
    log('Using in-memory storage, skipping MongoDB connection', 'mongoose');
    return null;
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    log('Connected to MongoDB database', 'mongoose');
    return mongoose.connection;
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'mongoose');
    log('Falling back to in-memory storage', 'mongoose');
    return null;
  }
}

export function disconnectFromDB() {
  if (!USE_MONGODB) return Promise.resolve();
  return mongoose.disconnect();
}