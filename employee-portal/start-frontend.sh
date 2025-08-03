#!/bin/bash

echo "🎨 Quick Frontend Start"
echo "======================="

cd /Users/srihariharans/Documents/workitems/bhava2/employee-portal/frontend

# Kill any existing process on port 4200
echo "🛑 Cleaning up port 4200..."
lsof -ti :4200 | xargs kill -9 2>/dev/null

# Start Angular server
echo "🚀 Starting frontend server..."
ng serve --port 4200 --host 0.0.0.0
