import mongoose from 'mongoose';
import { log } from '../vite';

// Connect to MongoDB database
export async function connectToDB(): Promise<boolean> {
  try {
    // Get connection string from environment variables
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ksrtc-concession';
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Connect to MongoDB
    await mongoose.connect(uri);
    
    log(`Connected to MongoDB successfully at ${uri}`, 'mongoose');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Disconnect from MongoDB database
export function disconnectFromDB(): void {
  try {
    mongoose.disconnect();
    log('Disconnected from MongoDB', 'mongoose');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}