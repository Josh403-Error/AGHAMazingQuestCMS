#!/bin/bash

# Script to start services individually for testing

echo "Starting PostgreSQL database..."
docker run -d \
  --name agaha_db \
  -e POSTGRES_DB=agha_db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

echo "Waiting for database to be ready..."
sleep 10

echo "Starting web service..."
cd backend
export DB_ENGINE=postgres
export DB_NAME=agha_db
export DB_USER=admin
export DB_PASSWORD=admin
export DB_HOST=localhost
export DB_PORT=5432
export DJANGO_SECRET_KEY="django-insecure-8i)k0@hetowp(8-+g6e222ejlkvdr44#8*7dg)f0m10m4*e63l"
export DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,hosting-pc.tail013787.ts.net"
export DJANGO_DEBUG=True

echo "Running migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Creating test user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='testuser').exists():
    User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpassword123',
        first_name='Test',
        last_name='User'
    )
    print('Created test user: testuser')
else:
    print('Test user already exists')
"

echo "Starting development server..."
python manage.py runserver 0.0.0.0:8000