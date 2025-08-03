#!/bin/bash

echo "🔧 Quick Backend Start"
echo "======================"

cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/backend

# Kill any existing process on port 3001
echo "🛑 Cleaning up port 3001..."
lsof -ti :3001 | xargs kill -9 2>/dev/null

# Set environment and start server
echo "🚀 Starting backend server..."
export NODE_ENV=development
node server.js
