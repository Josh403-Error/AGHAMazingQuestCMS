# Running the AGHAMazingQuestCMS

This document provides instructions for running the AGHAMazingQuestCMS application.

## Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend development)
- Docker and Docker Compose (for containerized deployment)
- pip package manager

## Installation and Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd AGHAMazingQuestCMS
```

### 2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Set up environment variables
Copy `.env.example` to `.env` and adjust the values as needed:
```bash
cp .env.example .env
```

## Running the Application

### Option 1: Development Mode (Django + React)

1. **Backend (Django server)**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Frontend (React development server)**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Option 2: Docker Compose (Production-like environment)

1. **Start all services**:
   ```bash
   cd deployment
   docker-compose up --build
   ```

2. **Initialize the CMS** (run once after the first setup):
   ```bash
   docker-compose exec web python manage.py initialize_cms
   ```

## Database Setup

The CMS uses PostgreSQL by default. When running in development mode, it will use SQLite if PostgreSQL is not available.

### Initial Setup
1. Run migrations:
   ```bash
   python manage.py migrate
   ```

2. Create initial data:
   ```bash
   python manage.py initialize_cms
   ```

## Accessing the CMS

- **Django Admin**: http://localhost:8080/admin/
  - Default credentials: admin / admin123

- **Wagtail CMS**: http://localhost:8080/cms/
  - Default credentials: admin / admin123

- **API Endpoints**: http://localhost:8080/api/
  - All API endpoints are documented in UNIFIED_CMS_DOCUMENTATION.md

- **Frontend**: http://localhost:3000 (development) or http://localhost:8080 (production)

## Available Management Commands

- `python manage.py initialize_cms` - Creates default roles and superuser
- `python manage.py createsuperuser` - Creates a new superuser
- `python manage.py collectstatic` - Collects static files

## API Endpoints

The CMS provides a comprehensive REST API:

- `GET /api/users/` - List all users
- `GET /api/roles/` - List all roles
- `GET /api/content/` - List all content
- `GET /api/analytics/` - List all analytics records
- `GET /api/system-stats/` - Get system statistics

For a complete list of endpoints, see UNIFIED_CMS_DOCUMENTATION.md

## Troubleshooting

1. **If Django fails to start**:
   - Make sure you've installed all requirements: `pip install -r backend/requirements.txt`
   - Ensure your SECRET_KEY is properly set in the environment

2. **If migrations fail**:
   - Run `python manage.py migrate` from the backend directory

3. **If you get 404 errors**:
   - Check that you're accessing the correct URL
   - Verify that the server is running

## Security Considerations

- Change default passwords immediately
- Use a strong SECRET_KEY in production
- Configure CSRF_TRUSTED_ORIGINS properly for your domain
- Set DEBUG=False in production environments

## Development

For development, the project is organized into several Django apps:
- `usermanagement` - Handles users, roles, and authentication
- `contentmanagement` - Manages content creation and approval
- `analyticsmanagement` - Tracks content and user analytics
- `api` - Provides REST API endpoints
- `authentication` - Handles authentication flows

## API Documentation

The API provides comprehensive endpoints for all CMS functionality. See UNIFIED_CMS_DOCUMENTATION.md for detailed information about all available endpoints and their usage.