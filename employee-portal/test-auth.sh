#!/bin/bash

echo "🔍 Employee Portal Authentication Test"
echo "======================================"

# Test 1: Check if backend server is running
echo "📡 Testing backend server health..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server is not responding"
    echo "🚀 Starting backend server..."
    cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/backend
    NODE_ENV=development node server.js &
    BACKEND_PID=$!
    echo "⏳ Waiting for server to start..."
    sleep 3
fi

# Test 2: Test authentication endpoint with EMP001
echo ""
echo "🔐 Testing authentication with EMP001/password123..."
AUTH_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "EMP001", "password": "password123"}' \
  http://localhost:3001/api/auth/login)

echo "Response: $AUTH_RESPONSE"

# Test 3: Check if token is returned
if echo "$AUTH_RESPONSE" | grep -q '"token"'; then
    echo "✅ Authentication successful - Token received"
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "🎫 Token: ${TOKEN:0:50}..."
else
    echo "❌ Authentication failed"
fi

# Test 4: Test with email format
echo ""
echo "📧 Testing authentication with demo@company.com/password123..."
EMAIL_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "demo@company.com", "password": "password123"}' \
  http://localhost:3001/api/auth/login)

echo "Response: $EMAIL_RESPONSE"

echo ""
echo "🎯 Test complete! Your credentials should work now:"
echo "   Employee ID: EMP001"
echo "   Password: password123"
echo "   OR"
echo "   Email: demo@company.com"
echo "   Password: password123"

# Clean up
if [ ! -z "$BACKEND_PID" ]; then
    echo ""
    echo "🛑 Backend server started with PID: $BACKEND_PID"
    echo "   Server will continue running for your testing"
fi
