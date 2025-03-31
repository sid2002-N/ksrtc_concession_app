#!/bin/bash

# Login as a college user
echo "Logging in as college1..."
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"college1","password":"password123","userType":"college"}' \
  -c cookies.txt

# Get the application ID (for demo purposes, we'll use ID 1)
APPLICATION_ID=1

# Update application status to college_verified
echo -e "\nUpdating application $APPLICATION_ID to college_verified..."
curl -X PATCH http://localhost:5000/api/applications/$APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"college_verified"}' \
  -b cookies.txt

# Cleanup
rm cookies.txt

echo -e "\nCheck the console for notification logs"
