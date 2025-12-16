# How to Run the AGHAMazing Quest CMS Application

This document provides step-by-step instructions to run the complete AGHAMazing Quest CMS application, which includes both the frontend and backend servers.

## Prerequisites

Before running the application, ensure you have:
- Python 3.12+
- Node.js 14+
- npm 6+

## Step-by-Step Instructions

### 1. Activate the Virtual Environment and Install Dependencies

```bash
# Navigate to the project root directory
cd /home/apcadmin/Documents/AGHAMazingQuestCMS

# Activate the virtual environment
source venv/bin/activate

# Install/update Python dependencies (if needed)
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Navigate back to the project root
cd ..
```

### 3. Set Environment Variables

The application requires specific environment variables. These are stored in the `.env` file:

```bash
# Check that the .env file exists and contains the necessary variables
cat .env
```

The file should contain:
```
DJANGO_SECRET_KEY=django-insecure-8i)k0@hetowp(8-+g6e222ejlkvdr44#8*7dg)f0m10m4*e63l
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=sqlite
```

### 4. Start the Backend Server

```bash
# Make sure you're in the project root directory
cd /home/apcadmin/Documents/AGHAMazingQuestCMS

# Export environment variables
export $(cat .env | xargs)

# Navigate to the backend directory
cd backend

# Start the Django development server
python manage.py runserver 0.0.0.0:8000
```

The backend server will be accessible at: http://localhost:8000

### 5. Start the Frontend Server

Open a new terminal window/tab and run:

```bash
# Navigate to the frontend directory
cd /home/apcadmin/Documents/AGHAMazingQuestCMS/frontend

# Start the React development server
npm start
```

The frontend server will automatically open your browser at: http://localhost:3000

### 6. Access the Application

1. Open your browser and go to http://localhost:3000
2. You'll see the login page with the APC and DOST-STII logos
3. Use one of the following credentials to log in:
   - Username: `superuser`, Password: `password123`
   - Username: [admin](file:///home/apcadmin/Documents/AGHAMazingQuestCMS/apps/usermanagement/admin.py#L0-L0), Password: `password123`
   - Username: `newuser`, Password: `password123`

### 7. Navigate the Application

After logging in, you'll be directed to the dashboard where you can:
- Manage content through the "Content Management" section
- View and generate analytics reports
- Manage users (if you have admin privileges)
- Update your account settings

## Troubleshooting

### If Port Conflicts Occur

If you see an error that ports 3000 or 8000 are already in use:

```bash
# Kill processes using port 3000 (frontend)
sudo fuser -k 3000/tcp

# Kill processes using port 8000 (backend)
sudo fuser -k 8000/tcp
```

Alternatively, you can find and kill specific processes:

```bash
# Find processes using port 8000
lsof -i :8000

# Kill the process (replace PID with actual process ID)
kill PID
```

### If Authentication Fails

If you encounter authentication issues:

1. Verify that the backend server is running properly
2. Check that you're using the correct credentials
3. Confirm that the user accounts exist by accessing the Django shell:

```bash
cd /home/apcadmin/Documents/AGHAMazingQuestCMS
export $(cat .env | xargs)
cd backend
python manage.py shell
```

Then in the shell:
```python
from django.contrib.auth import get_user_model
User = get_user_model()
users = User.objects.all()
for user in users:
    print(f"Username: {user.username}, Active: {user.is_active}")
```

### Restarting the Application

To restart the application:

1. Stop both servers (Ctrl+C in each terminal)
2. Follow steps 4 and 5 above to restart the servers

## Stopping the Application

To stop the application:

1. In the terminal running the frontend server, press Ctrl+C
2. In the terminal running the backend server, press Ctrl+C

## Additional Information

- The application uses JWT for authentication
- All API endpoints are prefixed with `/api/`
- The frontend communicates with the backend through RESTful APIs
- User data is stored in a SQLite database by default