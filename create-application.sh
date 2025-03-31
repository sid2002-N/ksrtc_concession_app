#!/bin/bash

# Login as student1
echo "Logging in as student1..."
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"password123","userType":"student"}' \
  -c cookies.txt

# Create a new application
echo -e "\nCreating a new application..."
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "startPoint": "Thiruvananthapuram",
    "endPoint": "College of Engineering",
    "depotId": 1
  }' \
  -b cookies.txt

# Cleanup
rm cookies.txt

echo -e "\nApplication created. Now you can run the notification test scripts."
