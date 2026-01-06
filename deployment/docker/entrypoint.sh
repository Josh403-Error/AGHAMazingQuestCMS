#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
# Wait for PostgreSQL to be ready
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "PostgreSQL is up - continuing"

# First, we need to mark the problematic Wagtail migrations as already run
# to avoid the dependency issue
echo "Initializing database with initial migrations..."

# Run the basic Django migrations first
python manage.py migrate contenttypes --no-input
python manage.py migrate auth --no-input
python manage.py migrate sessions --no-input
python manage.py migrate admin --no-input

# Run wagtailcore before other wagtail apps
python manage.py migrate wagtailcore --no-input

# Now run wagtail migrations individually to avoid dependency issues
python manage.py migrate wagtailusers --no-input
python manage.py migrate wagtaildocs --no-input
python manage.py migrate wagtailimages --no-input
python manage.py migrate wagtailadmin --no-input
python manage.py migrate wagtailredirects --no-input
python manage.py migrate wagtailforms --no-input
python manage.py migrate wagtailsearch --no-input
python manage.py migrate wagtailcontrib.settings --no-input
python manage.py migrate wagtail.contrib.modeladmin --no-input
python manage.py migrate wagtail.contrib.forms --no-input
python manage.py migrate wagtail.contrib.redirects --no-input
python manage.py migrate wagtail.contrib.sitemaps --no-input

# Run all remaining migrations
python manage.py migrate --no-input

# Create superuser if it doesn't exist
echo "Creating superuser if needed..."
python manage.py create_default_superuser

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the Django application
echo "Starting Django application..."
exec python manage.py runserver 0.0.0.0:8000