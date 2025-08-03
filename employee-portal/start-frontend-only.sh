#!/bin/bash

echo "🎨 Employee Portal - Frontend Only Setup"
echo "========================================"

# Navigate to frontend directory
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/frontend

# Kill any existing Angular processes
echo "🛑 Cleaning up existing frontend processes..."
pkill -f "ng serve" 2>/dev/null
lsof -ti :4200 | xargs kill -9 2>/dev/null
sleep 2

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "❌ Angular CLI not found. Installing..."
    npm install -g @angular/cli
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting Frontend Server (No Backend Required)..."
echo "======================================================"

# Start Angular development server
ng serve --port 4200 --host 0.0.0.0 &
FRONTEND_PID=$!

echo "⏳ Starting frontend server (PID: $FRONTEND_PID)..."
echo ""
echo "🎯 Frontend-Only Authentication Enabled!"
echo "========================================"
echo ""
echo "✅ No backend server required"
echo "✅ Authentication works locally in browser"
echo "✅ All demo data is stored in frontend"
echo ""
echo "🔑 Valid Login Credentials:"
echo "=========================="
echo "Employee ID: EMP001 | Password: password123"
echo "Employee ID: EMP002 | Password: password123"
echo "Employee ID: EMP003 | Password: password123"
echo "Employee ID: EMP004 | Password: password123"
echo "Employee ID: ADMIN  | Password: password123"
echo ""
echo "Email Format Also Works:"
echo "Email: demo@company.com     | Password: password123"
echo "Email: john.doe@company.com | Password: password123"
echo "Email: admin@company.com    | Password: password123"
echo ""

# Wait for server to start
sleep 8

# Check if frontend started
if lsof -i :4200 > /dev/null 2>&1; then
    echo "✅ Frontend server started successfully!"
    echo ""
    echo "🌐 Open your browser and go to:"
    echo "   http://localhost:4200"
    echo ""
    echo "🎯 What to expect:"
    echo "=================="
    echo "✅ Login form loads immediately"
    echo "✅ Enter EMP001/password123 and click Login"
    echo "✅ Shows 'Authenticating...' for 1 second"
    echo "✅ Automatically navigates to Dashboard"
    echo "✅ Dashboard shows employee profile and data"
    echo ""
    echo "🛑 To stop the server:"
    echo "   kill $FRONTEND_PID"
    echo "   or press Ctrl+C in this terminal"
    echo ""
    echo "🎉 Your Employee Portal is ready for frontend-only testing!"
else
    echo "❌ Frontend failed to start"
    echo "📋 Check the logs above for any errors"
    echo "💡 Try running: npm install && ng serve"
fi

# Keep script running
echo ""
echo "📊 Press Ctrl+C to stop the server"
wait $FRONTEND_PID
