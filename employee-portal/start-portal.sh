#!/bin/bash

echo "🚀 Employee Portal - Quick Start"
echo "================================"

# Kill any existing processes
echo "🛑 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "ng serve" 2>/dev/null
sleep 2

# Start Backend
echo "📡 Starting Backend Server..."
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/backend

# Set environment variables and start backend
export NODE_ENV=development
export PORT=3001
export JWT_SECRET="employee-portal-super-secret-key-2024"
export JWT_EXPIRES_IN="7d"
export FRONTEND_URL="http://localhost:4200"

echo "🌍 Environment: $NODE_ENV"
echo "🔧 Port: $PORT"

# Start backend in background
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!

echo "⏳ Starting backend (PID: $BACKEND_PID)..."
sleep 3

# Check if backend started
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Backend server started successfully!"
    
    # Test authentication immediately
    echo "🔐 Testing authentication..."
    AUTH_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"employeeId": "EMP001", "password": "password123"}' \
        http://localhost:3001/api/auth/login)
    
    if echo "$AUTH_RESPONSE" | grep -q '"token"'; then
        echo "✅ Authentication working perfectly!"
    else
        echo "⚠️  Authentication response:"
        echo "$AUTH_RESPONSE"
    fi
else
    echo "❌ Backend failed to start. Check backend.log for details:"
    tail -n 10 backend.log
    exit 1
fi

# Start Frontend
echo ""
echo "🎨 Starting Frontend Server..."
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/frontend

# Start frontend in background
nohup ng serve --port 4200 --host 0.0.0.0 > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "⏳ Starting frontend (PID: $FRONTEND_PID)..."
sleep 8

# Check if frontend started
if lsof -i :4200 > /dev/null 2>&1; then
    echo "✅ Frontend server started successfully!"
else
    echo "❌ Frontend failed to start. Check frontend.log for details:"
    tail -n 10 frontend.log
fi

echo ""
echo "🎯 Your Employee Portal is Ready!"
echo "================================="
echo "🌐 Frontend: http://localhost:4200"
echo "📡 Backend:  http://localhost:3001"
echo ""
echo "🔑 Login Credentials:"
echo "   Employee ID: EMP001"
echo "   Password:    password123"
echo ""
echo "� Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "✨ Open http://localhost:4200 and login now!"

# Show running processes
echo ""
echo "� Running processes:"
ps aux | grep -E "(node server.js|ng serve)" | grep -v grep
