#!/bin/bash

# This script switches the application back to using in-memory storage

# Update the storage configuration
echo "Updating storage configuration to use in-memory storage..."
sed -i 's/export const storage = new MongoDBStorage();/\/\/ export const storage = new MongoDBStorage();/' server/storage.ts
sed -i 's/\/\/ export const storage = new MemStorage();/export const storage = new MemStorage();/' server/storage.ts

# Create/update .env file to disable MongoDB
echo "# Storage Configuration" > .env
echo "USE_MONGODB=false" >> .env

# Export environment variables for current session
export USE_MONGODB="false"

echo "In-memory storage configuration complete. Restart the server to apply changes."