# Troubleshooting PostgreSQL Issues

This document provides solutions for common issues encountered when working with PostgreSQL in the AGHAMazing Quest CMS project.

## Common Issues and Solutions

### 1. Connection Refused Errors

**Problem:** Unable to connect to PostgreSQL database.
```
django.db.utils.OperationalError: could not connect to server: Connection refused
```

**Solution:**
1. Check that the PostgreSQL container is running:
   ```bash
   cd deployment
   docker-compose ps
   ```

2. Verify environment variables in `.env` file:
   ```bash
   cat ../.env | grep DB_
   ```

3. Confirm the database service is listening:
   ```bash
   docker-compose exec db pg_isready
   ```

### 2. Authentication Failed Errors

**Problem:** Authentication failure when connecting to PostgreSQL.
```
django.db.utils.OperationalError: FATAL: password authentication failed for user "agha_user"
```

**Solution:**
1. Check that database credentials in `.env` match those in `docker-compose.yml`:
   ```bash
   cat ../.env | grep DB_
   ```

2. If you've changed credentials, rebuild the containers:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### 3. Database Does Not Exist

**Problem:** Database does not exist.
```
django.db.utils.OperationalError: FATAL: database "agha_db" does not exist
```

**Solution:**
1. Check that the database name in `.env` matches the PostgreSQL initialization:
   ```bash
   echo $DB_NAME
   ```

2. Restart the database container to recreate the database:
   ```bash
   docker-compose restart db
   ```

### 4. Migration Issues

**Problem:** Django migrations fail when switching to PostgreSQL.
```
django.db.utils.ProgrammingError: column "xyz" of relation "abc" does not exist
```

**Solution:**
1. For development environments, reset the database:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. For production environments, investigate migration conflicts:
   ```bash
   docker-compose exec web python manage.py showmigrations
   ```

### 5. Permission Denied on Docker Commands

**Problem:** Permission denied when running docker-compose.
```
Permission denied while trying to connect to the Docker daemon socket
```

**Solution:**
1. Add your user to the docker group:
   ```bash
   sudo usermod -aG docker $USER
   ```

2. Log out and log back in, or run:
   ```bash
   newgrp docker
   ```

3. Alternatively, run docker-compose with sudo:
   ```bash
   sudo docker-compose up
   ```

## Testing Database Connectivity

### From Host Machine

To test database connectivity from the host machine:

1. Install PostgreSQL client:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql-client

   # macOS
   brew install libpq
   ```

2. Connect to the database:
   ```bash
   psql -h localhost -p 5433 -U agha_user -d agha_db
   ```

### From Another Container

To test database connectivity from another container:

```bash
docker-compose exec web pg_isready -h db -p 5432 -U agha_user
```

## Data Backup and Recovery

### Creating a Backup

```bash
docker-compose exec db pg_dump -U agha_user -d agha_db > backup.sql
```

### Restoring from Backup

```bash
docker-compose exec -T db psql -U agha_user -d agha_db < backup.sql
```

## Performance Tuning

### Monitoring Connections

Check active connections:
```bash
docker-compose exec db psql -U agha_user -d agha_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### Optimizing Queries

Enable query logging temporarily:
```bash
docker-compose exec db psql -U agha_user -d agha_db -c "SET log_statement = 'all';"
```

## Useful Docker Commands

### View Database Logs

```bash
docker-compose logs db
```

### Execute Commands in Database Container

```bash
docker-compose exec db psql -U agha_user -d agha_db
```

### Access Database Container Shell

```bash
docker-compose exec db bash
```

## Environment-Specific Configurations

### Development vs Production

In development, use:
```
DB_ENGINE=postgres
DB_NAME=agha_db
DB_USER=agha_user
DB_PASSWORD=agha_password
DB_HOST=db
DB_PORT=5432
```

In production, use stronger credentials and possibly external database:
```
DB_ENGINE=postgres
DB_NAME=production_agha_db
DB_USER=strong_user
DB_PASSWORD=very_strong_password
DB_HOST=external-db-host.example.com
DB_PORT=5432
```

## pgAdmin Troubleshooting

### Cannot Connect to Server

If pgAdmin cannot connect to the PostgreSQL server:

1. In pgAdmin, register a new server with these settings:
   - Host name/address: `db` (from within Docker network)
   - Port: `5432`
   - Maintenance database: `agha_db`
   - Username: `agha_user`
   - Password: `agha_password`

2. From host machine, use:
   - Host name/address: `localhost`
   - Port: `5433`

### Forgot pgAdmin Password

Reset pgAdmin password by recreating the container:
```bash
docker-compose down -v pgadmin_data
docker-compose up -d pgadmin
```

Then log in with the credentials from your `.env` file.