# AGHAMazing Quest CMS

A Content Management System for managing game content with workflow capabilities.

## Project Structure

The project has been reorganized for better maintainability and separation of concerns:

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
│   ├── deploy/             # Deployment configs (nginx, etc.)
│   ├── Dockerfile          # Docker image definition
│   └── docker-compose.yml  # Multi-container setup
├── scripts/                # Utility scripts
├── docs/                   # Documentation
└── README.md               # Main project documentation
```

See [docs/project_structure.md](docs/project_structure.md) for detailed information about the structure.

## Setup Instructions

### Automated Setup

Run the setup script to automatically configure your development environment:

```bash
./scripts/setup_dev_env.sh
```

### Manual Setup

#### Backend Setup

1. Create a virtual environment:
   ```
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Set up environment variables (see `.env.example`)

4. Run database migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

#### Frontend Setup

1. Install Node.js (v18 or higher)

2. Navigate to frontend directory:
   ```
   cd frontend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

## Deployment

For production deployment, use Docker:

```bash
cd deployment
docker-compose up --build
```

## API Endpoints

- Admin: `/admin/`
- API Authentication: `/api/auth/`
- API Content Management: `/api/content/`
- API User Management: `/api/users/`
- API Analytics: `/api/analytics/`
- Wagtail CMS: `/cms/`