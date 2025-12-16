#!/bin/bash

# AGHAMazing Quest CMS Startup Script

echo "Starting AGHAMazing Quest CMS..."

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a process is running
is_running() {
    if pgrep -f "$1" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on specific ports
kill_port_processes() {
    if command -v lsof >/dev/null 2>&1; then
        PORT_PROCESSES=$(lsof -ti :$1)
        if [ ! -z "$PORT_PROCESSES" ]; then
            echo -e "${YELLOW}Killing processes on port $1...${NC}"
            kill $PORT_PROCESSES 2>/dev/null
            sleep 2
        fi
    elif command -v fuser >/dev/null 2>&1; then
        echo -e "${YELLOW}Killing processes on port $1...${NC}"
        fuser -k $1/tcp 2>/dev/null
        sleep 2
    fi
}

# Kill any existing processes on our ports
kill_port_processes 3000
kill_port_processes 8000

# Check if we're in the right directory
if [ ! -f "manage.py" ] && [ ! -f "backend/manage.py" ]; then
    echo -e "${RED}Error: Cannot find manage.py. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to create virtual environment.${NC}"
        exit 1
    fi
    
    source venv/bin/activate
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install Python dependencies.${NC}"
        exit 1
    fi
else
    source venv/bin/activate
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Export environment variables
if [ -f ".env" ]; then
    export $(cat .env | xargs)
    echo -e "${GREEN}Environment variables loaded.${NC}"
else
    echo -e "${YELLOW}Warning: .env file not found. Using default settings.${NC}"
fi

# Start backend server in background
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if is_running "manage.py"; then
    echo -e "${GREEN}Backend server started successfully on http://localhost:8000${NC}"
else
    echo -e "${RED}Error: Failed to start backend server.${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
cd frontend
npm start &

# Wait a moment for frontend to start
sleep 5

if is_running "react-scripts"; then
    echo -e "${GREEN}Frontend server started successfully on http://localhost:3000${NC}"
else
    echo -e "${RED}Error: Failed to start frontend server.${NC}"
fi

cd ..

echo -e "${GREEN}AGHAMazing Quest CMS is now running!${NC}"
echo -e "${GREEN}Access the application at: http://localhost:3000${NC}"
echo -e "${GREEN}Backend API is available at: http://localhost:8000${NC}"
echo ""
echo -e "${YELLOW}Available test accounts:${NC}"
echo -e "${YELLOW}1. Username: superuser, Password: password123${NC}"
echo -e "${YELLOW}2. Username: admin, Password: password123${NC}"
echo -e "${YELLOW}3. Username: newuser, Password: password123${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the application.${NC}"

# Wait for user to press Ctrl+C
trap "echo -e '\n${YELLOW}Shutting down servers...${NC}'; kill $BACKEND_PID 2>/dev/null; killall npm 2>/dev/null; killall node 2>/dev/null; exit" INT
while true; do
    sleep 1
done