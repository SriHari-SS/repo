#!/bin/bash

echo "🚀 Starting Employee Portal Backend Server"
echo "=========================================="

# Navigate to backend directory
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/backend

# Kill any existing process on port 3001
echo "🛑 Cleaning up port 3001..."
lsof -ti :3001 | xargs kill -9 2>/dev/null

# Set environment variables
export NODE_ENV=development
export PORT=3001
export JWT_SECRET="employee-portal-super-secret-key-2024"
export JWT_EXPIRES_IN="7d"

# Start the server
echo "🚀 Starting backend server on port 3001..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo ""

node server.js
