#!/bin/bash

# First, login as student to submit payment
echo "Logging in as student1..."
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"password123","userType":"student"}' \
  -c cookies-student.txt

# Get the application ID (for demo purposes, we'll use ID 1)
APPLICATION_ID=1

# Submit payment for the application
echo -e "\nSubmitting payment for application $APPLICATION_ID..."
curl -X POST http://localhost:5000/api/applications/$APPLICATION_ID/payment \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN12345",
    "transactionDate": "2025-03-31",
    "accountHolder": "John Student",
    "amount": 500,
    "paymentMethod": "UPI"
  }' \
  -b cookies-student.txt

# Logout student
curl -X POST http://localhost:5000/api/logout -b cookies-student.txt

# Now login as depot to verify payment
echo -e "\n\nLogging in as depot1..."
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"depot1","password":"password123","userType":"depot"}' \
  -c cookies-depot.txt

# Verify payment
echo -e "\nVerifying payment for application $APPLICATION_ID..."
curl -X PATCH http://localhost:5000/api/applications/$APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"payment_verified"}' \
  -b cookies-depot.txt

# Cleanup
rm cookies-student.txt cookies-depot.txt

echo -e "\nCheck the console for notification logs"
