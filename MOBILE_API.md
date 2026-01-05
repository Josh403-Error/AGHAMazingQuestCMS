# Mobile AR Tour API Documentation

This document outlines the API endpoints available for the mobile AR tour application. The CMS has been configured as a headless CMS, allowing the mobile app to fetch content through Django middleware.

## Authentication

The API supports multiple authentication methods:

1. **Token Authentication**: Requires a valid token in the Authorization header
2. **JWT Authentication**: Requires a valid JWT token in the Authorization header
3. **Session Authentication**: For web-based interactions

### Authentication Endpoints

- `POST /auth/register/` - Register a new user
- `POST /auth/token/` - Obtain JWT token using email and password
- `POST /auth/token/refresh/` - Refresh JWT token
- `GET /auth/me/` - Get current user's profile

## Mobile AR Tour Specific Endpoints

### AR Markers

- `GET /api/markers/` - Get all AR markers
- `GET /api/markers/{id}/` - Get details of a specific marker
- `GET /api/nearby-markers/` - Get markers near the current location (accepts latitude and longitude as query parameters)

### Challenges

- `GET /api/challenges/` - Get all challenges
- `GET /api/challenges/{id}/` - Get details of a specific challenge
- `POST /api/challenges/{id}/complete/` - Mark a challenge as completed by the current user

### User Progress

- `GET /api/user-challenges/` - Get all challenges progress for the current user
- `GET /api/user-challenges/{id}/` - Get progress for a specific challenge
- `PUT/PATCH /api/user-challenges/{id}/` - Update progress for a specific challenge

### Content Categories

- `GET /api/categories/` - Get all content categories

### General Content

- `GET /api/content/` - Get all content items
- `GET /api/content/{id}/` - Get details of a specific content item
- `GET /api/user-content/` - Get content created by the current user

## Headless CMS Capabilities

The system has been configured as a headless CMS, meaning:

1. All content can be accessed via API endpoints
2. The mobile app can fetch content independently of the CMS interface
3. The same content management system serves both the web dashboard and mobile app
4. Content creators can manage content through the web interface while mobile users consume it via API

## Data Models

### Marker Model
- `id`: UUID identifier
- `code`: Unique marker code for AR recognition
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude
- `content_url`: URL to associated content
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Challenge Model
- `id`: UUID identifier
- `title`: Challenge title
- `description`: Challenge description
- `type`: Challenge type (scavenger_hunt, quiz, photo_challenge, ar_experience)
- `points`: Points awarded for completion
- `marker`: Associated AR marker (optional)
- `author`: Content creator

### ChallengeProgress Model
- `id`: UUID identifier
- `user`: User who is completing the challenge
- `challenge`: The challenge being completed
- `score`: Current score
- `completed_at`: When the challenge was completed (null if not completed)

## Mobile App Integration

The mobile AR tour app can integrate with this CMS by:

1. Authenticating users via the auth endpoints
2. Fetching available markers and challenges
3. Tracking user progress through challenge completion endpoints
4. Allowing users to access content associated with AR markers

## Error Handling

API responses follow standard HTTP status codes:
- 200: Success for GET requests
- 201: Created for POST requests
- 400: Bad request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Server error

## Example Request

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     http://localhost:8080/api/markers/
```

## Example Response

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "code": "AR_MARKER_001",
      "latitude": "14.5995",
      "longitude": "120.9842",
      "content_url": "/api/content/456e7890-f12b-34d5-a678-901234567001/",
      "content_title": "Historical Landmark",
      "content_body": "This is a description of the historical landmark...",
      "created_at": "2026-01-05T00:00:00Z",
      "updated_at": "2026-01-05T00:00:00Z"
    }
  ]
}
```

## Local Development Environment

The same API endpoints are available in the local development environment:
- Base URL: `http://localhost:8080/api/`
- All endpoints work with the same authentication and data models
- CORS is configured to allow requests from mobile applications