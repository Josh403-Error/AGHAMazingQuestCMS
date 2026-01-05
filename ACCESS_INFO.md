# AGHAMazing Quest CMS - Access Information

## System Overview

This is a headless CMS system with Django backend and React frontend. The system provides comprehensive content management capabilities with RESTful API access for external applications.

## Access URLs

- **Frontend**: http://localhost:8080
- **Django Admin**: http://localhost:8080/django-admin/
- **API Base URL**: http://localhost:8080/api/
- **API Documentation**: See MOBILE_API_INTEGRATION.md for mobile app integration

## Default Admin Credentials

- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

> **Important**: Change these credentials immediately after first login in production.

## Database Access

- **Database**: PostgreSQL
- **Host**: db:5432 (within Docker network)
- **Database Name**: agha_db
- **Username**: admin
- **Password**: changeme

## API Integration Management

The system includes a comprehensive API integration management system:

### For Administrators:
- Manage API keys through Django admin interface
- Set rate limits, IP whitelisting, and endpoint restrictions
- Monitor API usage through detailed logs
- See `API_INTEGRATION_ADMIN_GUIDE.md` for detailed instructions

### For Mobile App Team:
- API keys required for most endpoints
- Rate limiting implemented to prevent abuse
- Comprehensive documentation in `MOBILE_API_INTEGRATION.md`
- Unity C# integration examples provided

### Creating New API Keys:
1. Using Django Admin:
   - Navigate to "API Integrations" section
   - Click "Add API integration"
   - Fill in details and save

2. Using Management Command:
   ```bash
   docker exec deployment-web-1 python manage.py create_api_key \
     --name "AR Mobile App" \
     --description "API key for AR mobile application" \
     --rate-limit 2000
   ```

## Service Management

- **Frontend**: React app running on port 3000 (proxied through Nginx)
- **Backend**: Django app running on port 8000 (proxied through Nginx)
- **Database**: PostgreSQL on port 5432
- **Nginx**: Reverse proxy on port 8080

## Docker Containers

- **web**: Django application
- **db**: PostgreSQL database
- **nginx**: Reverse proxy and static file server
- **react**: React frontend

## Troubleshooting

### Common Issues:

1. **Django Admin Styles Not Loading**: Clear browser cache and restart services
2. **Database Connection Issues**: Check if the db container is running
3. **API Access Issues**: Verify API key authentication and permissions
4. **Frontend Not Loading**: Check react container and proxy configuration

### Useful Commands:

```bash
# Restart all services
docker-compose restart

# Check container logs
docker logs deployment-web-1
docker logs deployment-db-1
docker logs deployment-nginx-1
docker logs deployment-react-1

# Run Django management commands
docker exec deployment-web-1 python manage.py <command>

# Access database
docker exec -it deployment-db-1 psql -U admin agha_db
```

## Security Notes

- API keys are required for most API endpoints
- Rate limiting is enforced per API key
- IP whitelisting available for additional security
- Django admin has CSRF and other security measures enabled
- Use HTTPS in production deployments

## Ngrok Setup (Exposing Your Local System Publicly)

To expose your local AGHAMazingQuestCMS system to the public internet using ngrok, follow these steps:

### Prerequisites
1. Install ngrok from [https://ngrok.com/download](https://ngrok.com/download)
2. Ensure your CMS system is running normally with `docker-compose up`
3. **Note**: You'll need a free ngrok account for continued usage (required as of October 2023)

### Setup Process
1. Open a new terminal/command prompt and run:
   ```bash
   ngrok http 8080
   ```
   This will start ngrok and provide you with a public URL like `https://a1b2c3d4.ngrok.io`.

2. Use one of the provided scripts to update your environment variables:
   - For Windows (PowerShell): `cd scripts` then `.\ngrok_setup.ps1`
   - For Linux/Mac (Bash): `cd scripts` then `python3 setup_ngrok.py`

3. When prompted, enter the ngrok URL that ngrok displayed in the first terminal.

4. In your deployment directory, restart the web service to pick up the new environment variables:
   ```bash
   cd deployment
   docker-compose restart web
   ```

5. You can now access your CMS through the ngrok URL with all the same endpoints and services.

### Ngrok Services Available
When properly configured, the following services will be accessible via ngrok:
- Main Application: `https://<your-ngrok-url>/`
- Django Admin: `https://<your-ngrok-url>/django-admin/`
- Wagtail CMS: `https://<your-ngrok-url>/cms/`
- Mobile AR Tour API: `https://<your-ngrok-url>/api/`
- Authentication: `https://<your-ngrok-url>/auth/`

### Security Considerations
⚠️ **Important Security Notes**:
- Ngrok should only be used for temporary access, demos, or testing. Do not use for production.
- The system contains potentially sensitive content and user data. Be cautious about exposing this to the public internet.
- All services require authentication, but be aware that the public URL could be shared or discovered.
- After using ngrok, restore your original `.env` file to prevent configuration issues.

## Troubleshooting

### Common Issues and Solutions

1. **Service not accessible on localhost:8080**
   - If you're seeing a blank page, this has been fixed by updating the Nginx configuration to properly serve React static assets
   - Ensure all Docker containers are running: `docker ps`
   - Check logs for errors: `docker-compose logs web` or `docker-compose logs nginx`
   - Verify the deployment directory is the working directory when running Docker commands

2. **Django Admin styles missing**
   - This is often due to static files not being properly collected
   - Check that the Django container is properly serving static files

3. **Database connection errors**
   - Ensure the database container is running: `docker-compose logs db`
   - Check that the database credentials in your `.env` file are correct

4. **Wagtail CMS not loading properly**
   - Verify that the Wagtail container is running
   - Check that the database has been properly migrated

5. **API endpoints returning 404 or 403 errors**
   - Ensure you're authenticated when accessing protected endpoints
   - Check that your user has the appropriate permissions

### Verifying Services are Running

To check if all services are running correctly:
```bash
docker ps
```

You should see these containers running:
- deployment-web
- deployment-nginx
- deployment-db
- deployment-pgadmin

To check logs for a specific service:
```bash
docker-compose logs web      # for the Django/Wagtail application
docker-compose logs nginx    # for the Nginx proxy
docker-compose logs db       # for the database
docker-compose logs pgadmin  # for the pgAdmin interface
```

## Stopping the Services

To stop all services:
```bash
cd deployment
docker-compose down
```

## Additional Notes

- The system uses a custom user model with UUID primary keys
- Content management is handled through both Django Admin and Wagtail CMS
- The system has a role-based access control system with multiple permission levels
- All API endpoints require authentication except for specific public endpoints
- The system supports content workflows from creation to publication