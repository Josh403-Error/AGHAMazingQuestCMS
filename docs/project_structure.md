# Project Structure Documentation

This document explains the improved project structure for AGHAMazing Quest CMS.

## Overview

The project has been restructured to improve maintainability and separate concerns:

```
AGHAMazingQuestCMS/
├── backend/                 # Django backend application
│   ├── apps/               # Django applications
│   │   ├── analyticsmanagement/
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   └── usermanagement/
│   ├── config/             # Django project settings
│   ├── media/              # User uploaded files
│   ├── static/             # Static files
│   ├── staticfiles/        # Collected static files
│   ├── templates/          # Django templates
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── public/             # Public assets
│   └── src/                # Source code
├── deployment/             # Deployment configurations
│   ├── docker/             # Docker related files
│   ├── configs/            # Server configuration files (nginx, etc.)
│   ├── Dockerfile          # Docker image definition
│   └── docker-compose.yml  # Multi-container setup
├── scripts/                # Utility scripts
├── docs/                   # Documentation
└── README.md               # Main project documentation
```

## Directory Details

### backend/

Contains all Django backend code and related files:

- `apps/` - Django applications implementing specific functionality
- `config/` - Django settings and configuration
- `media/` - User uploaded content files
- `static/` - Static assets like CSS, JavaScript, images
- `templates/` - Django HTML templates
- `manage.py` - Django CLI utility

### frontend/

Houses the React frontend application:

- `public/` - Public assets served directly
- `src/` - React source code

### deployment/

All deployment-related files:

- `docker/` - Docker entrypoint scripts
- `configs/` - Server configuration files (nginx)
- `Dockerfile` - Docker image definition
- `docker-compose.yml` - Multi-container orchestration

### scripts/

Utility and helper scripts for development and maintenance.

### docs/

Project documentation files.

## Benefits of Restructuring

1. **Clear Separation of Concerns**: Frontend and backend code are completely separated
2. **Improved Maintainability**: Related files are grouped together logically
3. **Easier Deployment**: All deployment files are in one place
4. **Better Onboarding**: New developers can quickly understand the project structure
5. **Scalability**: Easy to add new components without cluttering the root directory

## Development Workflow

1. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

2. For backend development:
   ```bash
   cd backend
   python manage.py runserver
   ```

3. For frontend development:
   ```bash
   cd frontend
   npm start
   ```

## Deployment

Use Docker Compose for deployment:
```bash
cd deployment
docker-compose up --build
```