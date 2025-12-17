# PostgreSQL Integration Guide

This guide explains how to set up PostgreSQL database with pgAdmin4 for the AGHAMazing Quest CMS project.

## Prerequisites

Ensure you have Docker and Docker Compose installed on your system.

## Setup Instructions

### 1. Configure Environment Variables

The [.env](file:///home/apcadmin/Documents/AGHAMazingQuestCMS/.env) file has already been configured to use PostgreSQL with the following settings:

```
DB_ENGINE=postgres
DB_NAME=aghamazing_db
DB_USER=agha_user
DB_PASSWORD=agha_password
DB_HOST=db
DB_PORT=5432
```

### 2. Start Services with Docker Compose

From the `deployment` directory, run:

```bash
cd deployment
docker-compose up -d
```

This will start four services:
- PostgreSQL database (`db`)
- pgAdmin4 interface (`pgadmin`)
- Django web application (`web`)
- Nginx reverse proxy (`nginx`)

### 3. Access pgAdmin4

After starting the services, you can access pgAdmin4 at:
- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin

### 4. Configure pgAdmin4 to Connect to PostgreSQL

1. Open pgAdmin4 in your browser (http://localhost:5050)
2. Log in with the credentials above
3. Click "Add New Server" or right-click on "Servers" and select "Create > Server"
4. In the "General" tab, give the server a name (e.g., "AGHAMazing Quest CMS")
5. In the "Connection" tab, enter the following:
   - Host name/address: `db` (this is the service name in docker-compose)
   - Port: `5432`
   - Maintenance database: `aghamazing_db`
   - Username: `agha_user`
   - Password: `agha_password`
6. Click "Save"

### 5. Run Database Migrations

To set up the database schema, run the migrations:

```bash
docker-compose exec web python manage.py migrate
```

### 6. Create a Superuser

To access the Django admin interface, create a superuser:

```bash
docker-compose exec web python manage.py createsuperuser
```

## Service Ports

| Service     | Port  | URL                   |
|-------------|-------|------------------------|
| Django App  | 8000  | http://localhost:8000  |
| PostgreSQL  | 5432  | Internal access only   |
| pgAdmin4    | 5050  | http://localhost:5050  |
| Nginx       | 80    | http://localhost       |

## Troubleshooting

### Connection Issues

If you're having trouble connecting to the database:

1. Ensure all services are running:
   ```bash
   docker-compose ps
   ```

2. Check the logs for the database service:
   ```bash
   docker-compose logs db
   ```

### Resetting the Database

If you need to reset the database:

1. Stop the services:
   ```bash
   docker-compose down
   ```

2. Remove the volumes (this will delete all data):
   ```bash
   docker-compose down -v
   ```

3. Start the services again:
   ```bash
   docker-compose up -d
   ```

4. Run migrations and create a superuser as described above.

## Direct Database Access

If you need to access the PostgreSQL database directly, you can use:

```bash
docker-compose exec db psql -U agha_user -d aghamazing_db
```