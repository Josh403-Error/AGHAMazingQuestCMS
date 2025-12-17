# Running AGHAMazing Quest CMS

Instructions for setting up and running the AGHAMazing Quest CMS application.

## Prerequisites

- Docker and Docker Compose
- Node.js v18+ (for local frontend development)
- Python 3.11 (for local development)

## Quick Start with Docker (Recommended)

1. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

2. Start all services:
   ```bash
   cd deployment
   docker-compose up --build
   ```

3. Access the services:
   - Main Application: http://localhost
   - pgAdmin: http://localhost:5050
   - Direct Database Access: localhost:5433

## Environment Configuration

Before starting the application, make sure to copy `.env.example` to `.env` and adjust the values as needed:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Secret key for Django | change-me |
| `DJANGO_DEBUG` | Debug mode | False |
| `DJANGO_ALLOWED_HOSTS` | Allowed hosts | localhost,127.0.0.1,... |
| `DB_ENGINE` | Database engine | postgres |
| `DB_NAME` | Database name | agha_db |
| `DB_USER` | Database user | admin |
| `DB_PASSWORD` | Database password | changeme |
| `DB_HOST` | Database host | db |
| `DB_PORT` | Database port | 5432 |
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin login email | admin@example.com |
| `PGADMIN_DEFAULT_PASSWORD` | pgAdmin login password | supersecretpassword |

## Database Setup with PostgreSQL

The application is configured to use PostgreSQL as the primary database. The Docker Compose setup includes:

1. A PostgreSQL database server (postgres:15)
2. pgAdmin4 for database administration
3. Automatic connection between Django and PostgreSQL

### Initial Database Setup

When starting the application for the first time:

1. The database will be created with the specified credentials
2. Django migrations will be automatically applied
3. Static files will be collected

### Using pgAdmin

1. Navigate to http://localhost:5050
2. Log in with the credentials from your `.env` file
3. Register a new server with these connection details:
   - Host: `db` (when connecting from another container)
   - Host: `localhost` (when connecting from host machine)
   - Port: `5432`
   - Database: Value from `DB_NAME`
   - Username: Value from `DB_USER`
   - Password: Value from `DB_PASSWORD`

## Local Development Setup (Without Docker)

### Backend Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set up environment variables (see `.env.example`)

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Collect static files:
   ```bash
   python manage.py collectstatic
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Production Deployment

For production deployment, ensure:

1. Strong, unique secrets for `DJANGO_SECRET_KEY`
2. `DJANGO_DEBUG` is set to `False`
3. Proper database backups are configured
4. HTTPS is enabled
5. Access to pgAdmin port (5050) is restricted

## Troubleshooting

See our dedicated [PostgreSQL Troubleshooting Guide](docs/troubleshooting_postgresql.md) for solutions to common issues.

See [PostgreSQL and pgAdmin Setup](docs/postgresql_pgadmin_setup.md) for more detailed information.

## Backup and Restore

### Database Backup

```bash
docker-compose exec db pg_dump -U $DB_USER $DB_NAME > backup.sql
```

### Database Restore

```bash
docker-compose exec -T db psql -U $DB_USER $DB_NAME < backup.sql
```

