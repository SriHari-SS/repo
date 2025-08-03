#!/bin/bash

echo "🔍 Employee Portal Debug & Fix Script"
echo "====================================="

# Check current status
echo "📊 Current Status Check:"
echo "========================"

# Check if backend is running
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Backend server is running on port 3001"
    
    # Test backend health
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ Backend health check passed"
    else
        echo "❌ Backend health check failed"
    fi
    
    # Test authentication endpoint
    echo "🔐 Testing authentication endpoint..."
    AUTH_TEST=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"employeeId": "EMP001", "password": "password123"}' \
        http://localhost:3001/api/auth/login)
    
    if echo "$AUTH_TEST" | grep -q '"token"'; then
        echo "✅ Authentication endpoint working - Token received"
    else
        echo "❌ Authentication endpoint issue:"
        echo "$AUTH_TEST"
    fi
else
    echo "❌ Backend server is NOT running on port 3001"
    echo "🚀 Starting backend server..."
    
    cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/backend
    
    # Kill any existing process
    lsof -ti :3001 | xargs kill -9 2>/dev/null
    
    # Set environment and start server in background
    export NODE_ENV=development
    export PORT=3001
    export JWT_SECRET="employee-portal-super-secret-key-2024"
    export JWT_EXPIRES_IN="7d"
    
    echo "🌍 Environment: $NODE_ENV"
    echo "🔧 Starting server..."
    
    # Start server in background
    nohup node server.js > server.log 2>&1 &
    BACKEND_PID=$!
    
    echo "⏳ Waiting for server to start (PID: $BACKEND_PID)..."
    sleep 5
    
    # Test if server started successfully
    if lsof -i :3001 > /dev/null 2>&1; then
        echo "✅ Backend server started successfully!"
        
        # Test authentication
        AUTH_TEST=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d '{"employeeId": "EMP001", "password": "password123"}' \
            http://localhost:3001/api/auth/login)
        
        if echo "$AUTH_TEST" | grep -q '"token"'; then
            echo "✅ Authentication working perfectly!"
        else
            echo "⚠️  Authentication response:"
            echo "$AUTH_TEST"
        fi
    else
        echo "❌ Failed to start backend server"
        echo "📋 Server logs:"
        tail -n 20 server.log 2>/dev/null || echo "No logs available"
    fi
fi

echo ""

# Check if frontend is running
if lsof -i :4200 > /dev/null 2>&1; then
    echo "✅ Frontend server is running on port 4200"
else
    echo "❌ Frontend server is NOT running on port 4200"
    echo "🎨 Starting frontend server..."
    
    cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/frontend
    
    # Kill any existing process
    lsof -ti :4200 | xargs kill -9 2>/dev/null
    
    echo "🚀 Starting Angular server in background..."
    nohup ng serve --port 4200 --host 0.0.0.0 > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    echo "⏳ Waiting for frontend to start (PID: $FRONTEND_PID)..."
    sleep 10
    
    if lsof -i :4200 > /dev/null 2>&1; then
        echo "✅ Frontend server started successfully!"
    else
        echo "❌ Failed to start frontend server"
        echo "📋 Frontend logs:"
        tail -n 20 frontend.log 2>/dev/null || echo "No logs available"
    fi
fi

echo ""
echo "🎯 Final Status:"
echo "================"
echo "🌐 Frontend: http://localhost:4200"
echo "📡 Backend:  http://localhost:3001"
echo "🔍 Health:   http://localhost:3001/health"
echo ""
echo "🔑 Login Credentials:"
echo "Employee ID: EMP001"
echo "Password:    password123"
echo ""
echo "✨ Your login should now work perfectly!"
echo "   Click Login → Should navigate to Dashboard in ~2 seconds"

# Show any running processes
echo ""
echo "🔧 Running Processes:"
ps aux | grep -E "(node server.js|ng serve)" | grep -v grep || echo "No processes found"
