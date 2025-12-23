# Unified Headless CMS - AGHAMazingQuestCMS

This project provides a comprehensive headless CMS solution that integrates all models, configurations, and databases into a single, working web application with a robust RESTful API backend.

## Features

- Unified API endpoints for all models (Users, Roles, Content, Analytics)
- Seamless integration between all components
- RESTful API backend with authentication
- Comprehensive filtering, searching, and pagination
- Role-based access control
- Content management with status tracking
- Analytics tracking and reporting

## Architecture

The unified CMS includes:

- **User Management**: Custom user model with role-based permissions
- **Content Management**: Full-featured content creation and management
- **Analytics**: Comprehensive analytics tracking
- **API Layer**: RESTful API endpoints for all models
- **Authentication**: JWT and session-based authentication

## API Endpoints

### User Endpoints
- `GET /api/users/` - List all users with filtering and search
- `POST /api/users/` - Create a new user
- `GET /api/users/{id}/` - Retrieve a specific user
- `PUT /api/users/{id}/` - Update a user
- `DELETE /api/users/{id}/` - Delete a user

### Role Endpoints
- `GET /api/roles/` - List all roles
- `POST /api/roles/` - Create a new role
- `GET /api/roles/{id}/` - Retrieve a specific role
- `PUT /api/roles/{id}/` - Update a role
- `DELETE /api/roles/{id}/` - Delete a role

### Content Endpoints
- `GET /api/content/` - List all content with filtering and search
- `POST /api/content/` - Create new content (author auto-set to current user)
- `GET /api/content/{id}/` - Retrieve specific content
- `PUT /api/content/{id}/` - Update content
- `DELETE /api/content/{id}/` - Delete content

### Analytics Endpoints
- `GET /api/analytics/` - List all analytics records
- `POST /api/analytics/` - Create new analytics record
- `GET /api/analytics/{id}/` - Retrieve specific analytics record
- `PUT /api/analytics/{id}/` - Update analytics record
- `DELETE /api/analytics/{id}/` - Delete analytics record

### Special Endpoints
- `GET /api/system-stats/` - Get system-wide statistics
- `GET /api/user-content/` - Get content created by current user

## Setup Instructions

1. Ensure you have Docker and Docker Compose installed
2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AGHAMazingQuestCMS
   ```

3. Copy the environment file and configure your settings:
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

4. Navigate to the deployment directory and start the services:
   ```bash
   cd deployment
   docker-compose up --build -d
   ```

5. Wait for all services to start (2-3 minutes), then run migrations:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

## Usage

### Authentication
To access the API endpoints, you need to authenticate. You can use:
- Session authentication (for browser-based clients)
- Token authentication (for API clients)
- JWT authentication (for mobile/web apps)

### Example API Request
```bash
curl -X GET http://localhost:8080/api/content/ \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Filtering and Searching
All list endpoints support filtering, searching, and ordering:

- Filter by field: `?status=published&author=<user-id>`
- Search: `?search=<search-term>`
- Order: `?ordering=-created_at` (use `-` for descending)

## Models Integration

### User Model
- Custom user extending Django's AbstractUser
- Role-based permissions system
- Profile information and metadata

### Role Model
- Custom role system with permissions
- Flexible permission management

### Content Model
- Full content management with status workflow
- Author tracking and metadata
- Publication scheduling

### Analytics Model
- Comprehensive analytics tracking
- Content and user interaction metrics

## Security Features

- Authentication required for all API endpoints
- Role-based access control
- CSRF protection
- Input validation and sanitization
- Secure password handling

## Development

To run the project locally for development:

1. Install Python 3.11 and Node.js 18+
2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   
   ```bash
   cd frontend
   npm install
   ```

3. Run the development servers:
   ```bash
   # Backend
   cd backend
   python manage.py runserver
   
   # Frontend
   cd frontend
   npm start
   ```

## Deployment

The project is designed for containerized deployment using Docker Compose. For production deployment:

1. Configure your environment variables appropriately
2. Use SSL certificates for HTTPS
3. Set `DJANGO_DEBUG=False`
4. Configure a production database
5. Set up proper logging and monitoring

## Troubleshooting

If you encounter issues:

1. Check that all Docker containers are running:
   ```bash
   docker-compose ps
   ```

2. Check container logs:
   ```bash
   docker-compose logs <service-name>
   ```

3. Ensure your database is accessible and migrations are applied:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

4. Verify your environment variables are correctly set in the [.env](file:///C:/Users/apcadmin/Documents/GitHub/AGHAMazingQuestCMS/.env) file

## Support

For support, please open an issue in the repository or contact the development team.