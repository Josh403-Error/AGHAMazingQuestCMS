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

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AGHAMazingQuestCMS
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. Start all services:
   ```bash
   cd deployment
   docker-compose up --build
   ```

4. Access the services:
   - Main Application: http://localhost
   - pgAdmin: http://localhost:5050
   - Direct Database Access: localhost:5433

## Documentation

- [Running Instructions](RUNNING_INSTRUCTIONS.md)
- [PostgreSQL and pgAdmin Setup](docs/postgresql_pgadmin_setup.md)

## Project Structure

- `backend/`: Django backend application
- `frontend/`: React frontend application
- `deployment/`: Docker and Docker Compose configurations
- `docs/`: Project documentation
- `scripts/`: Utility scripts for development

## License

[MIT License](LICENSE)