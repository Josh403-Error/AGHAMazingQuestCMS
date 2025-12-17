# PostgreSQL and pgAdmin Setup Guide

This document describes how to set up and use PostgreSQL and pgAdmin with the AGHAMazingQuestCMS project.

## Overview

The project now includes PostgreSQL database and pgAdmin administration tool as part of its Docker Compose setup. This guide explains how to configure and use these services.

## Prerequisites

Ensure you have Docker and Docker Compose installed on your system.

## Configuration

### Environment Variables

Copy the `.env.example` file to `.env` and adjust the values as needed:

```bash
cp .env.example .env
```

Key environment variables for PostgreSQL and pgAdmin:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_ENGINE` | Database engine | postgres |
| `DB_NAME` | Database name | agha_db |
| `DB_USER` | Database user | admin |
| `DB_PASSWORD` | Database password | changeme |
| `DB_HOST` | Database host | db |
| `DB_PORT` | Database port | 5432 |
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin login email | admin@example.com |
| `PGADMIN_DEFAULT_PASSWORD` | pgAdmin login password | supersecretpassword |

### Docker Compose Services

The following services are defined in `deployment/docker-compose.yml`:

1. **db**: PostgreSQL database server (port 5433 on host)
2. **pgadmin**: pgAdmin web interface (port 5050 on host)
3. **web**: Django application
4. **nginx**: Reverse proxy

## Starting the Services

From the `deployment` directory, run:

```bash
docker-compose up --build
```

On first run, this will:
1. Create the PostgreSQL database with the specified credentials
2. Start pgAdmin with the specified admin credentials
3. Build and start the Django application
4. Configure nginx as a reverse proxy

## Accessing Services

After starting the services:

1. **Application**: http://localhost
2. **pgAdmin**: http://localhost:5050
3. **Direct database access**: localhost:5433

## Using pgAdmin

1. Navigate to http://localhost:5050
2. Log in with the credentials from your `.env` file:
   - Email: `PGADMIN_DEFAULT_EMAIL`
   - Password: `PGADMIN_DEFAULT_PASSWORD`
3. Register a new server with these connection details:
   - Host: `db` (when connecting from another container)
   - Host: `localhost` (when connecting from host machine)
   - Port: `5432`
   - Database: Value from `DB_NAME`
   - Username: Value from `DB_USER`
   - Password: Value from `DB_PASSWORD`

## Test User for Development

A test user is automatically created when the application starts:
- Username: `testuser`
- Password: `testpassword123`
- Email: `testuser@example.com`

This user is intended for development and testing purposes only. Do not use these credentials in production.

To create additional test users, you can use the script:
```bash
cd scripts
python create_test_user.py
```

Or customize the creation by passing arguments:
```bash
cd scripts
python create_test_user.py --username mytestuser --password mypassword
```

## Connecting to PostgreSQL from Django

The Django application automatically connects to PostgreSQL using the environment variables. The connection is configured in `backend/config/settings/base.py`.

Make sure these environment variables are set correctly:
- `DB_ENGINE=postgres`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST=db` (this is the service name in docker-compose)
- `DB_PORT=5432`

## Troubleshooting

### Connection Issues

1. Ensure all services are running:
   ```bash
   docker-compose ps
   ```

2. Check logs for specific services:
   ```bash
   docker-compose logs db
   docker-compose logs web
   ```

### Migration Problems

If you encounter migration issues after switching to PostgreSQL:

1. Ensure the database is clean (especially on first setup):
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. Manually run migrations:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

### Permission Errors

If you experience permission errors with PostgreSQL data:

1. Check volume permissions:
   ```bash
   docker-compose down -v
   docker volume ls  # Look for aghamazingquestcms_postgres_data
   docker volume rm [volume_name]
   ```

## Security Considerations

1. Change default passwords in production environments
2. Use strong, unique passwords for all services
3. Restrict access to pgAdmin port (5050) in production
4. Consider using SSL/TLS for database connections
5. Regularly update Docker images

## Backups

To backup the database:

```bash
docker-compose exec db pg_dump -U $DB_USER $DB_NAME > backup.sql
```

To restore from a backup:

```bash
docker-compose exec -T db psql -U $DB_USER $DB_NAME < backup.sql
```