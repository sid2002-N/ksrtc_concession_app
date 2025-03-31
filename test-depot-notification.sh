#!/bin/bash

# Login as a depot user
echo "Logging in as depot1..."
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"depot1","password":"password123","userType":"depot"}' \
  -c cookies.txt

# Get the application ID (for demo purposes, we'll use ID 1)
APPLICATION_ID=1

# Update application status to depot_approved
echo -e "\nUpdating application $APPLICATION_ID to depot_approved..."
curl -X PATCH http://localhost:5000/api/applications/$APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"depot_approved"}' \
  -b cookies.txt

# Cleanup
rm cookies.txt

echo -e "\nCheck the console for notification logs"
