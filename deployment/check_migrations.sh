#!/bin/bash
set -e

# Set the environment variables
export DJANGO_SETTINGS_MODULE=config.settings.unified
export DJANGO_SECRET_KEY=django-insecure-change-this-key-for-production
export DJANGO_DEBUG=True
export DB_ENGINE=django.db.backends.postgresql
export DB_NAME=questcms_db
export DB_USER=postgres
export DB_PASSWORD=postgres123
export DB_HOST=db
export DB_PORT=5432

echo "Checking migrations..."

# Wait for PostgreSQL to be ready
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "PostgreSQL is up - continuing"

# Show migrations
python manage.py showmigrations --plan