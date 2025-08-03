#!/bin/bash

echo "🎨 Starting Employee Portal Frontend Server"
echo "==========================================="

# Navigate to frontend directory
cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/frontend

# Kill any existing process on port 4200
echo "🛑 Cleaning up port 4200..."
lsof -ti :4200 | xargs kill -9 2>/dev/null

# Start the Angular server
echo "🚀 Starting Angular development server on port 4200..."
echo ""

ng serve --port 4200 --host 0.0.0.0
