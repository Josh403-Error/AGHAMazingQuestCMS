#!/bin/bash

# Script to start services using BuildKit

echo "Setting up environment variables..."
export DOCKER_BUILDKIT=1

echo "Starting services with Docker Compose using BuildKit..."
cd /home/apcadmin/Documents/AGHAMazingQuestCMS

# Load environment variables
set -a
[ -f .env ] && . .env
set +a

# Start services
docker-compose -f deployment/docker-compose.yml up --build -d

echo "Services started successfully!"
echo "Access the application at http://localhost:8080"
echo "Access pgAdmin at http://localhost:5050"
echo "Access the database on port 5433"