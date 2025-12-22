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
   - Main Application: http://localhost:8080
   - Django Admin: http://localhost:8080/admin/
   - Wagtail CMS: http://localhost:8080/cms/
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
4. Default roles and permissions will be created

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

## Django Admin Access

The Django Admin interface is accessible at http://localhost:8080/admin/

For detailed information about Django Admin setup and troubleshooting, see our [Django Admin Setup Guide](docs/django_admin_setup.md).

### Default Admin Credentials

A default admin user is created during the initial setup:

- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

### Creating Additional Admin Users

To create additional admin users:

```bash
docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User, Role; from django.contrib.auth.hashers import make_password; admin_role, _ = Role.objects.get_or_create(name='Admin', defaults={'description': 'Administrator'}); User.objects.create(email='newadmin@example.com', username='newadmin', first_name='New', last_name='Admin', role=admin_role, password=make_password('newpassword'), is_staff=True, is_superuser=True)"
```

### User Permissions Requirements

For a user to access the Django Admin interface, they must have:
- `is_staff = True`
- `is_superuser = True`

Update existing users with:
```bash
docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User; u = User.objects.get(email='user@example.com'); u.is_staff = True; u.is_superuser = True; u.save()"
```

## Application Services Overview

The Docker Compose setup includes four main services:

1. **web**: Django application server running on port 8000 internally
2. **db**: PostgreSQL database server
3. **nginx**: Reverse proxy serving the application on port 8080
4. **pgadmin**: Database administration interface on port 5050

### Service Interactions

- Nginx proxies requests to the Django application
- Django serves static files from the `/app/staticfiles` directory
- Frontend assets are served from the `/app/build` directory
- Django connects to PostgreSQL using the credentials in the `.env` file

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
6. Proper firewall rules are in place

## Troubleshooting

### Common Issues and Solutions

1. **Django Admin Styling Not Loading**
   - Ensure nginx is properly configured to serve static files from [/app/staticfiles/](file:///app/staticfiles/)
   - Restart nginx container after configuration changes:
     ```bash
     docker restart deployment-nginx-1
     ```

2. **Permission Denied When Accessing Django Admin**
   - Verify user has `is_staff=True` and `is_superuser=True` flags
   - Update user permissions:
     ```bash
     docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User; u = User.objects.get(email='admin@example.com'); u.is_staff = True; u.is_superuser = True; u.save()"
     ```

3. **Database Connection Issues**
   - Check that the database container is running:
     ```bash
     docker ps | grep deployment-db
     ```
   - Verify database credentials in [.env](file:///C:/Users/apcadmin/Documents/GitHub/AGHAMazingQuestCMS/.env) file

4. **Frontend Not Loading**
   - Ensure frontend has been built and `frontend/build` directory exists
   - Check nginx configuration for proper static file serving

For detailed Django Admin troubleshooting, see our [Django Admin Setup Guide](docs/django_admin_setup.md).

### Checking Service Status

To check if all services are running:
```bash
docker ps
```

To check logs for a specific service:
```bash
docker logs <container-name>
```

For example, to check web service logs:
```bash
docker logs deployment-web-1
```

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