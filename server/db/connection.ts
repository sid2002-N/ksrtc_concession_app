import mongoose from 'mongoose';
import { log } from '../vite';

// Connect to MongoDB database
export async function connectToDB(): Promise<boolean> {
  try {
    // Get connection string from environment variables
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ksrtc-concession';
    
    // Log the connection attempt
    log(`Attempting to connect to MongoDB at ${uri}`, 'mongoose');
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err.message}`, 'mongoose');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', 'mongoose');
    });
    
    // Connect to MongoDB
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    log(`Connected to MongoDB successfully at ${uri}`, 'mongoose');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log(`Error connecting to MongoDB: ${error.message}`, 'mongoose');
      if (error.stack) {
        log(`Stack trace: ${error.stack}`, 'mongoose');
      }
    } else {
      log('Unknown error connecting to MongoDB', 'mongoose');
    }
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