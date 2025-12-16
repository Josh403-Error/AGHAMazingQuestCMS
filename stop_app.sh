#!/bin/bash

# AGHAMazing Quest CMS Stop Script

echo "Stopping AGHAMazing Quest CMS..."

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill processes by name
kill_process() {
    PROCESS_NAME=$1
    if pgrep -f "$PROCESS_NAME" > /dev/null; then
        echo -e "${YELLOW}Stopping $PROCESS_NAME...${NC}"
        pkill -f "$PROCESS_NAME"
        sleep 2
        
        # Force kill if still running
        if pgrep -f "$PROCESS_NAME" > /dev/null; then
            pkill -9 -f "$PROCESS_NAME"
        fi
    else
        echo -e "${GREEN}$PROCESS_NAME is not running.${NC}"
    fi
}

# Kill backend server
kill_process "manage.py runserver"

# Kill frontend server
kill_process "react-scripts start"

# Kill any remaining Node processes
if pgrep -f "node" > /dev/null; then
    echo -e "${YELLOW}Stopping remaining Node processes...${NC}"
    pkill -f "node"
fi

echo -e "${GREEN}AGHAMazing Quest CMS has been stopped.${NC}"