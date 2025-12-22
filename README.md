# AGHAMazing Quest CMS

A Content Management System for managing game content with workflow capabilities.

## Features

- Content creation, editing, approval, and publishing workflows
- Role-based user management and permissions
- Analytics dashboard for content performance tracking
- Integration with Wagtail CMS for rich content editing
- RESTful API for frontend integration

## Tech Stack

- Frontend: React v19.2.0 with React Router v7.9.4
- Backend: Python 3.11 with Django and Django REST Framework
- CMS: Wagtail
- Database: PostgreSQL with pgAdmin for administration
- Deployment: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js v18+ (for local frontend development)
- Python 3.11 (for local development)

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AGHAMazingQuestCMS
```

### 2. Configure Environment Variables
Copy the example environment file and customize it:
```bash
cp .env.example .env
```

Edit the [.env](file:///C:/Users/apcadmin/Documents/GitHub/AGHAMazingQuestCMS/.env) file with your configuration. Key variables include:
- `DJANGO_SECRET_KEY`: Secret key for Django application
- `DB_PASSWORD`: PostgreSQL database password
- `PGADMIN_DEFAULT_PASSWORD`: pgAdmin default password

### 3. Build and Start Services
Navigate to the deployment directory and start all services:
```bash
cd deployment
docker-compose up --build
```

This will start four containers:
- `deployment-web-1`: Django application server
- `deployment-db-1`: PostgreSQL database
- `deployment-nginx-1`: Nginx reverse proxy
- `deployment-pgadmin-1`: pgAdmin web interface

## Accessing Services

After successful startup, you can access the following services:

| Service | URL | Notes |
|---------|-----|-------|
| Main Application | http://localhost:8080 | React frontend with integrated CMS |
| Django Admin | http://localhost:8080/admin/ | Administrative interface |
| Wagtail CMS | http://localhost:8080/cms/ | Content management system |
| pgAdmin | http://localhost:5050 | Database administration tool |
| Direct Database Access | localhost:5433 | Direct PostgreSQL connection |

### Django Admin Credentials

To access the Django Admin interface, use the following credentials:
- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

For detailed information about Django Admin setup and troubleshooting, see our [Django Admin Setup Guide](docs/django_admin_setup.md).

## Application Workflows

The CMS supports a complete content workflow:

1. **Content Creation**: Users with Encoder role can create content
2. **Content Editing**: Editors can modify content
3. **Content Approval**: Approvers can approve content for publication
4. **Content Publishing**: Admins can publish approved content

## Managing Users and Roles

### Creating Test Users

To create a test user with default role:
```bash
docker exec -it deployment-web-1 python manage.py create_test_user
```

To create a superuser:
```bash
docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User, Role; from django.contrib.auth.hashers import make_password; admin_role, _ = Role.objects.get_or_create(name='Admin', defaults={'description': 'Administrator'}); User.objects.create(email='your-email@example.com', username='yourusername', first_name='First', last_name='Last', role=admin_role, password=make_password('yourpassword'), is_staff=True, is_superuser=True)"
```

### Available Roles

The system comes with predefined roles:
- **Encoder**: Can create content
- **Editor**: Can create and edit content
- **Approver**: Can approve content for publication
- **Admin**: Can publish content
- **Super Admin**: Full system access

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

## Development

### Local Frontend Development

To develop the frontend locally:
```bash
cd frontend
npm install
npm start
```

This will start the React development server on http://localhost:3000

### Local Backend Development

For backend development:
1. Set up a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Configure environment variables as needed

3. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Documentation

- [Running Instructions](RUNNING_INSTRUCTIONS.md)
- [PostgreSQL and pgAdmin Setup](docs/postgresql_pgadmin_setup.md)
- [Django Admin Setup Guide](docs/django_admin_setup.md)

## Project Structure

- `backend/`: Django backend application
  - `apps/`: Individual Django applications
    - `authentication/`: User authentication
    - `contentmanagement/`: Content management features
    - `usermanagement/`: User and role management
    - `analyticsmanagement/`: Analytics and reporting
  - `config/`: Django settings and configuration
- `frontend/`: React frontend application
- `deployment/`: Docker and Docker Compose configurations
- `docs/`: Project documentation
- `scripts/`: Utility scripts for development

## License

[MIT License](LICENSE)