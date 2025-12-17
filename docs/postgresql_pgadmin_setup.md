# PostgreSQL and pgAdmin4 Setup Guide

This document explains how to set up PostgreSQL database and pgAdmin4 administration tool using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Basic understanding of Docker concepts

## Services Overview

The Docker Compose configuration includes:

1. **PostgreSQL Database** (version 15)
   - Port mapping: 5433 (host) -> 5432 (container)
   - Database name: `aghamazing_db`
   - User: `agha_user`
   - Password: `agha_password`

2. **pgAdmin4**
   - Port mapping: 5050 (host) -> 80 (container)
   - Default login: admin@example.com / admin

## Starting the Services

To start PostgreSQL and pgAdmin4:

```bash
cd deployment/
sudo docker-compose up -d
```

## Accessing Services

### PostgreSQL Database

Connect to PostgreSQL using any PostgreSQL client:

- Host: localhost
- Port: 5433
- Database: aghamazing_db
- Username: agha_user
- Password: agha_password

Example using psql command:
```bash
psql -h localhost -p 5433 -U agha_user -d aghamazing_db
```

### pgAdmin4

Access pgAdmin4 through your web browser:

- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin

## Configuring pgAdmin4 to Connect to PostgreSQL

After logging into pgAdmin4:

1. Click "Add New Server"
2. In the "General" tab:
   - Name: AghamazingQuestCMS
3. In the "Connection" tab:
   - Host name/address: db (this is the service name in docker-compose)
   - Port: 5432
   - Maintenance database: aghamazing_db
   - Username: agha_user
   - Password: agha_password
   - Save password: Yes
4. Click "Save"

## Stopping the Services

To stop the services:

```bash
cd deployment/
sudo docker-compose down
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port mappings in `docker-compose.yml`
2. **Permission denied**: Make sure you're running docker commands with sudo or add your user to the docker group
3. **Connection refused**: Check that the services are running with `docker-compose ps`

### Checking Service Status

```bash
cd deployment/
sudo docker-compose ps
```

### Viewing Logs

```bash
cd deployment/
sudo docker-compose logs [service_name]
```

Replace `[service_name]` with `db` for PostgreSQL or `pgadmin` for pgAdmin4.

## Integration with Django Application

The Django application is configured to use PostgreSQL when the following environment variables are set:

```bash
DB_ENGINE=postgres
DB_NAME=aghamazing_db
DB_USER=agha_user
DB_PASSWORD=agha_password
DB_HOST=db
DB_PORT=5432
```

When running with Docker Compose, these variables are automatically used by the web service.