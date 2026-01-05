# Ngrok Setup Guide for AGHAMazingQuestCMS

This document explains how to expose your local AGHAMazingQuestCMS system to the public internet using ngrok.

## Prerequisites

1. Install ngrok:
   - Download from [https://ngrok.com/download](https://ngrok.com/download)
   - Or install via package manager (e.g., `choco install ngrok` on Windows)

2. (Optional) Sign up for an ngrok account to get custom domains and additional features

## Configuration Steps

### 1. Start the CMS System

First, ensure your system is running normally:

```bash
cd c:\Users\apcadmin\Documents\GitHub\AGHAMazingQuestCMS\deployment
docker-compose up --build
```

### 2. Update Environment Variables for Ngrok

When using ngrok, you'll need to update the `.env` file with the ngrok tunnel URL. Since ngrok provides a new URL each time, you'll need to update it dynamically.

First, start ngrok on port 8080:

```bash
ngrok http 8080
```

This will provide a public URL like `https://a1b2c3d4.ngrok.io` (or similar).

Then update your `.env` file temporarily:

```bash
# Replace with your actual ngrok URL
WAGTAILADMIN_BASE_URL=https://a1b2c3d4.ngrok.io
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,hosting-pc.tail013787.ts.net,a1b2c3d4.ngrok.io
CSRF_TRUSTED_ORIGINS=https://a1b2c3d4.ngrok.io,http://localhost:8080,http://localhost:8000,http://127.0.0.1:8080
DJANGO_CSRF_TRUSTED_ORIGINS=https://a1b2c3d4.ngrok.io,http://localhost:8080,http://localhost:8000,http://127.0.0.1:8080
```

### 3. Restart the Services

After updating the environment variables, restart the web service:

```bash
# In the deployment directory
docker-compose restart web
```

### 4. Complete Ngrok Setup Script

Here's a complete script to automate the process:

```bash
#!/bin/bash
# For Linux/Mac - for Windows, use PowerShell equivalent commands

echo "Starting AGHAMazingQuestCMS with Ngrok..."

# Start ngrok in the background
ngrok http 8080 > /dev/null 2>&1 &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Get the ngrok URL (this might need to be manually copied from ngrok UI on Windows)
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])")

echo "Ngrok URL: $NGROK_URL"

# Update environment variables temporarily
export WAGTAILADMIN_BASE_URL="$NGROK_URL"
export DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,hosting-pc.tail013787.ts.net,$(echo $NGROK_URL | sed 's|https://||')"
export CSRF_TRUSTED_ORIGINS="$NGROK_URL,http://localhost:8080,http://localhost:8000,http://127.0.0.1:8080"
export DJANGO_CSRF_TRUSTED_ORIGINS="$NGROK_URL,http://localhost:8080,http://localhost:8000,http://127.0.0.1:8080"

echo "Environment variables updated."

# Restart the web service to pick up new environment variables
cd deployment
docker-compose restart web

echo "Services restarted. CMS is now accessible at: $NGROK_URL"
echo "Press Ctrl+C to stop the ngrok tunnel."
echo "Don't forget to restart the system with original settings after you're done."

# Wait for user to stop the process
wait $NGROK_PID
```

For Windows PowerShell, the equivalent would be:

```powershell
Write-Host "Starting AGHAMazingQuestCMS with Ngrok..."

# Start ngrok in the background (you may need to adjust the path to ngrok.exe)
Start-Process -FilePath "ngrok.exe" -ArgumentList "http", "8080"

Write-Host "Ngrok started. Please check the ngrok UI for your public URL."
Write-Host "Then manually update your .env file with the new URL:"
Write-Host ""
Write-Host "WAGTAILADMIN_BASE_URL=<YOUR_NGROK_URL>"
Write-Host "DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,hosting-pc.tail013787.ts.net,<NGROK_HOSTNAME>"
Write-Host "CSRF_TRUSTED_ORIGINS=<YOUR_NGROK_URL>,http://localhost:8080,http://localhost:8000,http://127.0.0.1:8080"
Write-Host "DJANGO_CSRF_TRUSTED_ORIGINS=<YOUR_NGROK_URL>,http://localhost:8080,http://localhost:8000,http://127.0.0.1:8080"
Write-Host ""
Write-Host "After updating the .env file, restart the web service:"
Write-Host "cd deployment"
Write-Host "docker-compose restart web"
```

## Services Accessible via Ngrok

When properly configured, the following services will be accessible:

- **Main Application**: `<ngrok-url>/` - React frontend with integrated CMS
- **Django Admin**: `<ngrok-url>/django-admin/` - Administrative interface
- **Wagtail CMS**: `<ngrok-url>/cms/` - Content management system
- **API Endpoints**: `<ngrok-url>/api/` - REST API for mobile AR tour app

## Security Considerations

⚠️ **Important Security Notes**:

1. **Temporary Access**: Ngrok should primarily be used for temporary access, demos, or testing. Do not use for production.

2. **Sensitive Data**: The system contains user data, content, and potentially sensitive information. Be cautious about exposing this to the public internet.

3. **Authentication**: All services require authentication, but the public URL could be shared or discovered.

4. **Database Access**: The PostgreSQL database on port 5433 is NOT exposed through ngrok (only through localhost), which is correct for security.

5. **Environment Reset**: After using ngrok, reset your `.env` file to the original settings to prevent configuration issues.

## Troubleshooting

1. **"Invalid Host Header" Error**: This means the `DJANGO_ALLOWED_HOSTS` doesn't include your ngrok URL.

2. **Static Files Not Loading**: Check that the `WAGTAILADMIN_BASE_URL` is set correctly.

3. **API Calls Failing**: Verify that `CSRF_TRUSTED_ORIGINS` includes your ngrok URL.

4. **Login Issues**: Make sure you're using the ngrok URL and not localhost for accessing the admin interface.

## Alternative: Ngrok Configuration File

You can also create an ngrok configuration file to avoid re-entering settings:

Create `~/.ngrok2/ngrok.yml`:

```yaml
authtoken: YOUR_AUTH_TOKEN  # Optional but recommended
tunnels:
  cms:
    proto: http
    addr: 8080
    subdomain: aghamazingquest  # Optional: if you have a reserved domain
```

Then start with: `ngrok start cms`

## Conclusion

Yes, the entire AGHAMazingQuestCMS system can be hosted via ngrok. The architecture is well-suited for this since:
- It's a containerized application with a single external port (8080)
- The reverse proxy (Nginx) correctly handles all sub-paths
- All services are properly configured to work through a proxy
- The Django/Wagtail applications respect the proxy headers

The main requirement is updating the allowed hosts and trusted origins to include the ngrok URL before starting the tunnel.