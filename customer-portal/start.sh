#!/bin/bash

# Customer Portal Startup Script
# This script starts both the frontend and backend services

echo "🚀 Starting Customer Portal Application..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -i :$1 > /dev/null 2>&1; then
        echo -e "${YELLOW}Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Install backend dependencies
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}Backend dependencies already installed${NC}"
    fi
    cd ..
    
    # Install frontend dependencies
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}Frontend dependencies already installed${NC}"
    fi
    cd ..
}

# Function to check environment file
check_env() {
    echo -e "${BLUE}🔧 Checking environment configuration...${NC}"
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}📝 Please update backend/.env with your SAP credentials before running in production${NC}"
    else
        echo -e "${GREEN}✅ Environment file found${NC}"
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔙 Starting backend server...${NC}"
    cd backend
    
    if check_port 3000; then
        npm start &
        BACKEND_PID=$!
        echo -e "${GREEN}✅ Backend started on http://localhost:3000${NC}"
        cd ..
        return 0
    else
        echo -e "${RED}❌ Backend port 3000 is already in use${NC}"
        cd ..
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting frontend application...${NC}"
    cd frontend
    
    # Start Angular dev server
    ng serve --port 4200 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started on http://localhost:4200${NC}"
    cd ..
}

# Function to show status
show_status() {
    echo ""
    echo -e "${GREEN}🎉 Application Successfully Started!${NC}"
    echo "=========================================="
    echo -e "${BLUE}📱 Frontend:${NC} http://localhost:4200"
    echo -e "${BLUE}🔙 Backend:${NC}  http://localhost:3000"
    echo -e "${BLUE}📊 API Docs:${NC} http://localhost:3000/api"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "   • Use customer ID: 0000000003 and password: password123 for testing"
    echo "   • Backend runs in development mode with fallback data"
    echo "   • Check backend/.env for SAP configuration"
    echo ""
    echo -e "${YELLOW}🛑 To stop services:${NC} Press Ctrl+C"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    echo -e "${GREEN}👋 Goodbye!${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    # Check if we're in the right directory
    if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
        echo -e "${RED}❌ Error: Please run this script from the customer-portal root directory${NC}"
        echo -e "${YELLOW}Expected structure:${NC}"
        echo "  customer-portal/"
        echo "  ├── frontend/"
        echo "  ├── backend/"
        echo "  └── start.sh"
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Check environment
    check_env
    
    # Start services
    start_backend
    if [ $? -eq 0 ]; then
        sleep 2  # Give backend time to start
        start_frontend
        
        # Show status
        sleep 5  # Give frontend time to start
        show_status
        
        # Keep script running
        wait
    else
        echo -e "${RED}❌ Failed to start backend. Exiting...${NC}"
        exit 1
    fi
}

# Run main function
main
