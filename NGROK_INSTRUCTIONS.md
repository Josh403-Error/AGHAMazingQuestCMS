# Ngrok Setup for AGHAMazingQuestCMS

This document provides instructions on how to expose your local AGHAMazingQuestCMS system to the public internet using ngrok.

## Prerequisites

1. **Install ngrok**:
   - Download from [https://ngrok.com/download](https://ngrok.com/download)
   - Or install via package manager (e.g., `choco install ngrok` on Windows)

2. **Running CMS System**:
   - Ensure your AGHAMazingQuestCMS is running normally with `docker-compose up`

## Setup Process

### Step 1: Start ngrok tunnel

Open a new terminal/command prompt and run:

```bash
ngrok http 8080
```

This will start ngrok and provide you with a public URL like `https://a1b2c3d4.ngrok.io`.

### Step 2: Update environment variables

Use one of the provided scripts to update your environment variables:

#### For Windows (PowerShell):
```powershell
cd scripts
.\ngrok_setup.ps1
```

#### For Linux/Mac (Bash):
```bash
cd scripts
python3 setup_ngrok.py
```

When prompted, enter the ngrok URL that ngrok displayed in the first terminal.

### Step 3: Restart the web service

In your deployment directory, restart the web service to pick up the new environment variables:

```bash
cd deployment
docker-compose restart web
```

### Step 4: Access your CMS

You can now access your CMS through the ngrok URL:

- **Main Application**: `https://<your-ngrok-url>/`
- **Django Admin**: `https://<your-ngrok-url>/django-admin/`
- **Wagtail CMS**: `https://<your-ngrok-url>/cms/`
- **API Endpoints**: `https://<your-ngrok-url>/api/`

## Services Available via Ngrok

Once properly configured, the following services will be accessible:

| Service | URL |
|---------|-----|
| Main Application | `https://<your-ngrok-url>/` |
| Django Admin | `https://<your-ngrok-url>/django-admin/` |
| Wagtail CMS | `https://<your-ngrok-url>/cms/` |
| Mobile AR Tour API | `https://<your-ngrok-url>/api/` |
| Authentication | `https://<your-ngrok-url>/auth/` |

## Security Considerations

⚠️ **Important Security Notes**:

1. **Temporary Access Only**: Ngrok should only be used for temporary access, demos, or testing. Do not use for production.

2. **Sensitive Data**: The system contains user data, content, and potentially sensitive information. Be cautious about exposing this to the public internet.

3. **Authentication Required**: All services require authentication, but be aware that the public URL could be shared or discovered.

4. **Database Access**: The PostgreSQL database on port 5433 and pgAdmin on port 5050 remain accessible only locally for security.

5. **Environment Reset**: After using ngrok, restore your original `.env` file to prevent configuration issues.

## Restoring Original Configuration

After you're done using ngrok:

1. Stop the ngrok process (Ctrl+C in the ngrok terminal)

2. Restore your original `.env` file:
   - If using the PowerShell script: The backup is saved as `.env.backup`
   - Copy this file back to `.env`

3. Restart the web service:
   ```bash
   cd deployment
   docker-compose restart web
   ```

## Troubleshooting

### Common Issues:

1. **"Invalid Host Header" Error**: This means the `DJANGO_ALLOWED_HOSTS` doesn't include your ngrok URL. Make sure you updated the environment variables and restarted the web service.

2. **Static Files Not Loading**: Check that the `WAGTAILADMIN_BASE_URL` is set correctly to your ngrok URL.

3. **API Calls Failing**: Verify that `CSRF_TRUSTED_ORIGINS` includes your ngrok URL.

4. **Login Issues**: Make sure you're accessing the admin interface using the ngrok URL and not localhost.

### Checking if Services are Running:

To verify that your services are running correctly:
```bash
docker ps
```

You should see all your containers running:
- deployment-web
- deployment-nginx
- deployment-db
- deployment-pgadmin

## Alternative: Ngrok Configuration File

For more control, you can create an ngrok configuration file:

Create `~/.ngrok2/ngrok.yml`:
```yaml
authtoken: YOUR_AUTH_TOKEN  # Optional but recommended
tunnels:
  cms:
    proto: http
    addr: 8080
```

Then start with: `ngrok start cms`

## Conclusion

The AGHAMazingQuestCMS system is well-suited for temporary ngrok exposure, making it perfect for demos, testing with remote stakeholders, or sharing the CMS for review purposes. The architecture with Docker containers and Nginx reverse proxy works effectively with ngrok's tunneling mechanism.