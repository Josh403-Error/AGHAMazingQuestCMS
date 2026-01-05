# AR Mobile App API Integration Guide

This document provides all the necessary information for the AR mobile app team to integrate with our headless CMS API.

## Base URL

The API is accessible at: `http://localhost:8080/api/`

> **Note**: For production deployments, replace `localhost:8080` with your actual domain.

## Authentication

### API Key Authentication

To access the API, you need to provide an API key in the request header:

```
Authorization: Api-Key <your-api-key>
```

## Getting an API Key

API keys are managed by administrators through the Django admin interface. To get an API key:

1. Contact an administrator to create an API integration for your mobile app
2. The administrator will provide you with an API key
3. Use this key in the `Authorization` header for all API requests

## Available Endpoints

### AR Markers

#### List All Markers
```
GET /api/markers/
```

**Description**: Get a list of all AR markers in the system.

**Parameters**:
- `latitude` and `longitude` for location-based filtering (optional)
- `search` for text search (optional)
- `ordering` for sorting (e.g., `-created_at` for newest first)

**Response**:
```json
{
  "id": "uuid",
  "code": "marker_code",
  "latitude": 12.345678,
  "longitude": 98.765432,
  "content_url": "http://example.com/content/uuid/",
  "content_title": "Title of the content",
  "content_body": "Body of the content",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Get a Specific Marker
```
GET /api/markers/{id}/
```

**Description**: Get details of a specific AR marker.

### Challenges

#### List All Challenges
```
GET /api/challenges/
```

**Description**: Get a list of all challenges in the system.

**Parameters**:
- `search` for text search (optional)
- `ordering` for sorting (optional)

**Response**:
```json
{
  "id": "uuid",
  "title": "Challenge title",
  "description": "Challenge description",
  "type": "type_of_challenge",
  "points": 100,
  "requirements": "Challenge requirements",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Get a Specific Challenge
```
GET /api/challenges/{id}/
```

**Description**: Get details of a specific challenge.

### Complete a Challenge
```
POST /api/challenges/{challenge_id}/complete/
```

**Description**: Mark a challenge as completed by the authenticated user.

**Response**:
```json
{
  "id": "uuid",
  "user": "user_id",
  "challenge": {
    "id": "challenge_id",
    "title": "Challenge title",
    // ... challenge details
  },
  "score": 100,
  "completed_at": "2023-01-01T00:00:00Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Content Categories

#### List All Content Categories
```
GET /api/categories/
```

**Description**: Get a list of all content categories.

### User Challenges

#### List User's Challenge Progress
```
GET /api/user-challenges/
```

**Description**: Get a list of challenges completed or in progress by the authenticated user.

#### Get Specific Challenge Progress
```
GET /api/user-challenges/{id}/
```

**Description**: Get details of a specific challenge progress for the authenticated user.

### Nearby Markers

#### Get Markers Near Location
```
GET /api/nearby-markers/
```

**Description**: Get markers near a specific location.

**Parameters**:
- `latitude` (required if longitude is provided)
- `longitude` (required if latitude is provided)

## API Integration Management (For Admins)

Administrators can manage API integrations through the Django admin interface:

1. Go to: `http://localhost:8080/django-admin/`
2. Log in with admin credentials
3. Navigate to "API Integrations" section
4. Create, update, or delete API integrations as needed

### API Integration Fields:
- **Name**: Name of the integration (e.g., "AR Mobile App")
- **Description**: Brief description of the integration
- **API Key**: Unique key for authentication (auto-generated)
- **Active**: Whether the integration is active
- **Allowed Endpoints**: Comma-separated list of allowed endpoints (leave empty for all)
- **IP Whitelist**: Comma-separated list of allowed IP addresses (leave empty for no restrictions)
- **Rate Limit**: Number of requests allowed per hour (default: 1000)

### API Integration Logs
Administrators can view logs of API requests in the Django admin under "API Integration Logs" to monitor usage and troubleshoot issues.

## Example Unity C# Code

Here's an example of how to make an API request from Unity:

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class APIManager : MonoBehaviour
{
    private const string BASE_URL = "http://localhost:8080/api/";
    private const string API_KEY = "your-api-key-here";

    public void GetMarkers()
    {
        StartCoroutine(GetMarkersCoroutine());
    }

    private IEnumerator GetMarkersCoroutine()
    {
        using (UnityWebRequest request = UnityWebRequest.Get(BASE_URL + "markers/"))
        {
            request.SetRequestHeader("Authorization", "Api-Key " + API_KEY);
            
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string response = request.downloadHandler.text;
                Debug.Log("Markers: " + response);
                // Process the response here
            }
            else
            {
                Debug.LogError("Error: " + request.error);
            }
        }
    }
    
    public void CompleteChallenge(string challengeId)
    {
        StartCoroutine(CompleteChallengeCoroutine(challengeId));
    }

    private IEnumerator CompleteChallengeCoroutine(string challengeId)
    {
        string url = BASE_URL + $"challenges/{challengeId}/complete/";
        
        using (UnityWebRequest request = UnityWebRequest.Post(url, ""))
        {
            request.SetRequestHeader("Authorization", "Api-Key " + API_KEY);
            
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string response = request.downloadHandler.text;
                Debug.Log("Challenge completed: " + response);
            }
            else
            {
                Debug.LogError("Error completing challenge: " + request.error);
            }
        }
    }
}
```

## Rate Limiting

The API implements rate limiting. By default, each API key is limited to 1000 requests per hour. If you exceed this limit, you'll receive a `429 Too Many Requests` response.

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Requested resource doesn't exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Troubleshooting

If you're having issues with the API:

1. Verify your API key is correct
2. Check that your API key is active in the Django admin
3. Confirm you're using the correct base URL
4. Check the API integration logs in Django admin for any issues
5. Ensure you're not exceeding the rate limit

## Support

For additional support with the API integration, contact the CMS administrators.