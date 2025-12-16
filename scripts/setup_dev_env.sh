#!/bin/bash

# Setup development environment for AGHAMazing Quest CMS

echo "Setting up development environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install backend dependencies
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Development environment setup complete!"
echo ""
echo "To activate the environment, run:"
echo "  source venv/bin/activate"
echo ""
echo "To start the backend server, run:"
echo "  cd backend && python manage.py runserver"
echo ""
echo "To start the frontend server, run:"
echo "  cd frontend && npm start"