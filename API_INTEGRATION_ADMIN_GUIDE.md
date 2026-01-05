# API Integration Management Guide

This document provides instructions for administrators to manage API integrations for external applications, especially the AR mobile app.

## Overview

The system provides a comprehensive API integration management system that includes:
- API key generation and management
- Rate limiting
- IP whitelisting
- Access control
- Request logging and monitoring

## Creating API Integrations

### Using Django Admin Interface

1. Go to `http://localhost:8080/django-admin/`
2. Log in with admin credentials
3. Navigate to "API Integrations" in the admin menu
4. Click "Add API integration"
5. Fill in the required fields:
   - **Name**: A descriptive name (e.g., "AR Mobile App")
   - **Description**: Details about the integration
   - **Active**: Whether the integration is active
   - **Rate Limit**: Requests allowed per hour (default: 1000)
   - **Allowed Endpoints**: Comma-separated list of allowed endpoints (leave empty for all)
   - **IP Whitelist**: Comma-separated list of allowed IP addresses (leave empty for no restrictions)

### Using Management Command

You can also create API keys using the Django management command:

```bash
docker exec deployment-web-1 python manage.py create_api_key \
  --name "AR Mobile App" \
  --description "API key for AR mobile application" \
  --rate-limit 2000 \
  --active \
  --allowed-endpoints "/api/markers/*,/api/challenges/*" \
  --ip-whitelist "192.168.1.100,10.0.0.50"
```

## API Key Security

- API keys are automatically generated with strong cryptographic randomness
- Keys are masked in the Django admin interface for security
- Keys should be stored securely by the client applications
- Compromised keys can be deactivated immediately through the admin interface

## Rate Limiting

Each API key has a configurable rate limit (requests per hour):
- Default: 1000 requests per hour
- Can be adjusted based on application needs
- Exceeding the limit results in a `429 Too Many Requests` response
- Rate limiting is tracked by IP address and API key combination

## Monitoring API Usage

### API Integration Logs

Access logs through Django admin:
1. Go to `http://localhost:8080/django-admin/`
2. Navigate to "API Integration Logs"
3. Filter by integration, endpoint, status code, or time range
4. Monitor usage patterns and troubleshoot issues

### Log Information

Each API request logs:
- Associated integration
- Accessed endpoint
- HTTP method used
- Client IP address
- User agent string
- Response status code
- Response time
- Request timestamp

## Endpoint Restrictions

API keys can be restricted to specific endpoints:
- Enter comma-separated endpoint patterns (e.g., `/api/markers/*`, `/api/challenges/*`)
- Patterns support wildcards (`*`) for flexible matching
- Leave empty to allow access to all endpoints
- Requests to disallowed endpoints return a `403 Forbidden` response

## IP Whitelisting

For additional security, API keys can be restricted to specific IP addresses:
- Enter comma-separated IP addresses (e.g., `192.168.1.100,10.0.0.50`)
- Requests from non-whitelisted IPs return a `403 Forbidden` response
- Leave empty to allow requests from any IP address

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Verify the API key is correct and active
2. **403 Forbidden**: Check endpoint restrictions and IP whitelist settings
3. **429 Too Many Requests**: Review rate limit settings or implement request caching
4. **500 Server Error**: Check server logs for detailed error information

### Debugging Steps

1. Check API Integration Logs for failed request details
2. Verify API key status in Django admin
3. Confirm endpoint access permissions
4. Validate IP address against whitelist
5. Check rate limit configuration

## Security Best Practices

- Regularly rotate API keys for enhanced security
- Use IP whitelisting when possible
- Monitor API logs for unusual activity
- Implement appropriate rate limits based on application needs
- Deactivate API keys when no longer needed
- Never expose API keys in client-side code or public repositories

## Mobile App Integration

For the AR mobile app team:
- Provide the generated API key securely
- Refer to `MOBILE_API_INTEGRATION.md` for implementation details
- Ensure the app handles authentication errors gracefully
- Implement appropriate caching to reduce API calls and avoid rate limiting