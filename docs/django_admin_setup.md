# Django Admin Setup and Troubleshooting Guide

This document describes how to set up and troubleshoot the Django Admin interface in the AGHAMazingQuestCMS project.

## Overview

The Django Admin interface provides a powerful administrative interface for managing users, content, and other data in the CMS. This guide covers setup, access, customization, and common troubleshooting steps.

## Prerequisites

Ensure you have Docker and Docker Compose installed on your system and the application is running.

## Accessing Django Admin

The Django Admin interface is accessible at: http://localhost:8080/admin/

### Default Admin Credentials

A default admin user is created during the initial setup:

- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

### Creating Additional Admin Users

To create additional admin users, use the following command:

```bash
docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User, Role; from django.contrib.auth.hashers import make_password; admin_role, _ = Role.objects.get_or_create(name='Admin', defaults={'description': 'Administrator'}); User.objects.create(email='newadmin@example.com', username='newadmin', first_name='New', last_name='Admin', role=admin_role, password=make_password('newpassword'), is_staff=True, is_superuser=True)"
```

### User Permissions Requirements

For a user to access the Django Admin interface, they must have:
- `is_staff = True` - Allows access to the admin site
- `is_superuser = True` - Grants all permissions

To update an existing user's permissions:

```bash
docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User; u = User.objects.get(email='user@example.com'); u.is_staff = True; u.is_superuser = True; u.save()"
```

## Django Admin Customization

### User Management

The Django Admin has been customized to properly display and manage the custom User model. The customization includes:

1. Displaying relevant fields in list view:
   - Email
   - Username
   - First name
   - Last name
   - Role
   - Staff status
   - Active status

2. Search functionality for:
   - Email
   - Username
   - First name
   - Last name

3. Filtering options:
   - Staff status
   - Active status
   - Role
   - Creation date

### Role Management

Roles can be managed through the Django Admin interface with:
- Name and description fields
- Creation and modification dates
- Associated users count

## Static Files Configuration

Proper styling of the Django Admin interface depends on correctly serving static files through nginx.

### Nginx Configuration

The nginx configuration must properly serve static files from the Django staticfiles directory:

```nginx
location /static/ {
    alias /app/staticfiles/;
}
```

This ensures that CSS, JavaScript, and image files required by the Django Admin are served correctly.

### Troubleshooting Static Files Issues

If the Django Admin interface appears unstyled:

1. Check that nginx is configured to serve static files from [/app/staticfiles/](file:///app/staticfiles/)
2. Verify that Django static files have been collected:
   ```bash
   docker exec -it deployment-web-1 ls /app/staticfiles/
   ```
3. Restart the nginx container:
   ```bash
   docker restart deployment-nginx-1
   ```

## Security Considerations

### CSRF Protection

The Django Admin requires proper CSRF configuration when accessed through a proxy. Ensure that trusted origins are configured in `settings.py`:

```python
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',  # Nginx proxy port
    'http://localhost:8000',  # Direct Django access
]
```

### Session Security

For production deployments:
1. Use HTTPS
2. Set secure session cookies
3. Regularly rotate secret keys
4. Implement proper access controls

## Common Issues and Solutions

### 1. Unable to Log In

**Symptoms**: Correct credentials are rejected

**Solution**: Verify user permissions
```bash
docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User; u = User.objects.get(email='admin@example.com'); print('Is staff:', u.is_staff); print('Is superuser:', u.is_superuser)"
```

If either is False, update the permissions:
```bash
docker exec -it deployment-web-1 python manage.py shell -c "from apps.usermanagement.models import User; u = User.objects.get(email='admin@example.com'); u.is_staff = True; u.is_superuser = True; u.save()"
```

### 2. Unstyled Admin Interface

**Symptoms**: Plain HTML without CSS styling

**Solution**: Check static files configuration
1. Verify nginx serves static files from [/app/staticfiles/](file:///app/staticfiles/)
2. Restart nginx container
3. Check that static files exist:
   ```bash
   docker exec -it deployment-web-1 python manage.py collectstatic --noinput
   ```

### 3. "Forbidden" or CSRF Errors

**Symptoms**: 403 Forbidden errors when submitting forms

**Solution**: Check CSRF trusted origins
1. Ensure `http://localhost:8080` is in `CSRF_TRUSTED_ORIGINS`
2. Restart the web container:
   ```bash
   docker restart deployment-web-1
   ```

### 4. Models Not Appearing in Admin

**Symptoms**: Custom models don't appear in the admin interface

**Solution**: Check admin registration
1. Verify the model is registered in the app's `admin.py`
2. Check for errors in the Django application:
   ```bash
   docker logs deployment-web-1
   ```

## Advanced Configuration

### Customizing Admin Interface

To customize the Django Admin interface for additional models:

1. Edit the model's `admin.py` file
2. Register the model with a custom admin class
3. Define display fields, filters, and search options

Example:
```python
from django.contrib import admin
from .models import YourModel

@admin.register(YourModel)
class YourModelAdmin(admin.ModelAdmin):
    list_display = ('field1', 'field2', 'created_at')
    search_fields = ('field1', 'field2')
    list_filter = ('created_at', 'status')
```

### Adding Custom Actions

Custom actions can be added to the admin interface:

```python
from django.contrib import admin
from .models import YourModel

@admin.register(YourModel)
class YourModelAdmin(admin.ModelAdmin):
    actions = ['mark_as_published']
    
    def mark_as_published(self, request, queryset):
        queryset.update(status='published')
    mark_as_published.short_description = "Mark selected items as published"
```

## Monitoring and Maintenance

### Checking Admin Access Logs

Monitor admin access through Django logs:
```bash
docker logs deployment-web-1 | grep -i admin
```

### Regular Maintenance Tasks

1. **Update static files** after Django or package updates:
   ```bash
   docker exec -it deployment-web-1 python manage.py collectstatic --noinput
   ```

2. **Check for security issues**:
   ```bash
   docker exec -it deployment-web-1 python manage.py check --deploy
   ```

3. **Backup database regularly** to protect admin-managed data

## Conclusion

The Django Admin interface is a crucial part of the AGHAMazingQuestCMS system. Proper configuration of user permissions, static files, and security settings ensures smooth operation. Regular monitoring and maintenance will keep the admin interface secure and functional.