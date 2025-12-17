#!/usr/bin/env bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "PostgreSQL is up - continuing"

# Run database migrations, collect static files, then start Gunicorn.
# This script assumes environment variables are provided via an .env file
# mounted or passed to the container.

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create a test user if one doesn't already exist
echo "Creating test user if it doesn't exist..."
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

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3