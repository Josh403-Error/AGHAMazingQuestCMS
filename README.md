# AGHAMazing Quest CMS

A Content Management System for managing game content with workflow capabilities.

## Project Structure

```
AGHAMazingQuestCMS/
├── backend/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   ├── analyticsmanagement/
│   │   └── branding/
│   ├── config/
│   │   ├── settings/
│   │   ├── asgi.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── static/
│   ├── templates/
│   └── tests/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── assets/
│   ├── package.json
│   ├── package-lock.json
│   └── build/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   ├── development/
│   └── user-guides/
├── deployment/
│   ├── docker/
│   ├── docker-compose.yml
│   └── nginx.conf
├── scripts/
│   ├── setup/
│   ├── deployment/
│   ├── testing/
│   └── utilities/
├── tests/
│   ├── integration/
│   ├── unit/
│   └── smoke/
├── .env.example
├── .env
├── README.md
└── CHANGELOG.md
```

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

## Development

### Backend Development
To run the backend locally:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend Development
To run the frontend locally:
```bash
cd frontend
npm install
npm start
```

## Scripts

The project includes various scripts organized in the [scripts](file:///C:/Users/apcadmin/Documents/GitHub/AGHAMazingQuestCMS/scripts) directory:

- **setup/**: Scripts for initializing the CMS and creating test users
- **deployment/**: Scripts for deployment-related tasks
- **testing/**: Scripts for testing and validation
- **utilities/**: Utility scripts for development and maintenance

## Documentation

Comprehensive documentation is available in the [docs](file:///C:/Users/apcadmin/Documents/GitHub/AGHAMazingQuestCMS/docs) directory:

- **architecture/**: Architecture decisions and system design
- **api/**: API documentation and specifications
- **deployment/**: Deployment guides and procedures
- **development/**: Development guidelines and best practices
- **user-guides/**: User guides and tutorials