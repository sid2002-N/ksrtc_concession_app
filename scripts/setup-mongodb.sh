#!/bin/bash

# This script sets up the MongoDB connection for the application

# Set MongoDB URI
echo "Setting up MongoDB connection..."
echo "Enter MongoDB URI (e.g., mongodb://localhost:27017/ksrtc_concession):"
read mongo_uri

# Add MongoDB URI to environment variables
echo "Adding MongoDB URI to environment variables..."
export MONGODB_URI="$mongo_uri"
export USE_MONGODB="true"

# Create/update .env file with the MongoDB settings
echo "# MongoDB Configuration" > .env
echo "MONGODB_URI=$mongo_uri" >> .env
echo "USE_MONGODB=true" >> .env

# Update the storage configuration
echo "Updating storage configuration to use MongoDB..."
sed -i 's/\/\/ export const storage = new MongoDBStorage();/export const storage = new MongoDBStorage();/' server/storage.ts
sed -i 's/export const storage = new MemStorage();/\/\/ export const storage = new MemStorage();/' server/storage.ts

echo "MongoDB configuration complete. Restart the server to apply changes."