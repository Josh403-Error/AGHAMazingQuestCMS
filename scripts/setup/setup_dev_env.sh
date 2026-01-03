#!/bin/bash

# Setup script for AGHAMazing Quest CMS development environment with PostgreSQL

set -e  # Exit on any error

echo "Setting up AGHAMazing Quest CMS development environment..."

# Check if we're in the right directory
if [[ ! -f "manage.py" && ! -d "backend" ]]; then
    echo "Error: Please run this script from the project root directory."
    exit 1
fi

# Determine if we're in the root or backend directory
if [[ -f "manage.py" ]]; then
    BACKEND_DIR="."
elif [[ -d "backend" ]]; then
    BACKEND_DIR="backend"
    cd backend
else
    echo "Error: Cannot find Django project structure."
    exit 1
fi

echo "Using backend directory: $BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [[ ! -d "../venv" && ! -d "venv" ]]; then
    echo "Creating virtual environment..."
    python3 -m venv ../venv || python3 -m venv venv
fi

# Activate virtual environment
if [[ -d "../venv" ]]; then
    source ../venv/bin/activate
elif [[ -d "venv" ]]; then
    source venv/bin/activate
else
    echo "Error: Could not find or create virtual environment."
    exit 1
fi

echo "Virtual environment activated."

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo "Installing Python dependencies..."
if [[ -f "requirements.txt" ]]; then
    pip install -r requirements.txt
elif [[ -f "../backend/requirements.txt" ]]; then
    pip install -r ../backend/requirements.txt
else
    echo "Error: Cannot find requirements.txt file."
    exit 1
fi

# Go back to project root
cd ..

# Check if PostgreSQL is running
if ! pg_ctl status > /dev/null 2>&1; then
    echo "Error: PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create database if it doesn't exist
DB_NAME=$(grep 'NAME' $BACKEND_DIR/aghazamazing/settings.py | grep -v 'ENGINE' | awk '{print $3}' | tr -d "',")
if [[ -z "$DB_NAME" ]]; then
    DB_NAME="aghazamazing"
fi

if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Creating PostgreSQL database: $DB_NAME..."
    createdb $DB_NAME
else
    echo "PostgreSQL database '$DB_NAME' already exists."
fi

# Go to backend directory for Django commands
cd $BACKEND_DIR

# Copy .env.example to .env if .env doesn't exist
if [[ ! -f ".env" ]]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please review and update the .env file with your configuration."
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist
echo "from django.contrib.auth import get_user_model; User = get_user_model(); exit(0) if User.objects.filter(is_superuser=True).exists() else exit(1)" | python manage.py shell 2>/dev/null
if [[ $? -ne 0 ]]; then
    echo "Creating superuser..."
    echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin')" | python manage.py shell
    echo "Created default superuser: admin / admin"
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput -c

echo ""
echo "Development environment setup complete!"
echo ""
echo "To start the development server:"
echo "  1. Activate virtual environment: source ../venv/bin/activate (or source venv/bin/activate)"
echo "  2. Start the server: python manage.py runserver"
echo ""
echo "Default superuser credentials: admin / admin"
echo "Remember to change these in production!"