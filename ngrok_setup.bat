@echo off
REM Batch file to help with ngrok setup for AGHAMazingQuestCMS

echo AGHAMazingQuestCMS - Ngrok Setup
echo ================================

REM Check if ngrok is installed
where ngrok >nul 2>&1
if errorlevel 1 (
    echo Error: ngrok is not installed or not in PATH
    echo Please install ngrok from https://ngrok.com/download
    echo Or install via Chocolatey: choco install ngrok
    pause
    exit /b 1
)

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running or accessible
    echo Please start Docker Desktop and ensure it's running
    pause
    exit /b 1
)

echo Docker is running and services are accessible
echo.

echo Before proceeding:
echo 1. Make sure your CMS is running with: docker-compose up
echo 2. Open another terminal and run: ngrok http 8080
echo 3. Copy the forwarding URL (e.g., https://a1b2c3d4.ngrok.io)
echo.

set /p NGROK_URL="Enter your ngrok URL (include https://): "

if "%NGROK_URL%"=="" (
    echo No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo Setting up ngrok for URL: %NGROK_URL%
echo.

REM Create backup of .env file
copy ..\.env ..\.env.backup
echo Backup created: ..\.env.backup

REM Process .env file to update ngrok-specific values
powershell -Command "(Get-Content ..\.env) | ForEach-Object { if ($_ -match '^WAGTAILADMIN_BASE_URL=') { 'WAGTAILADMIN_BASE_URL=%NGROK_URL%' } elseif ($_ -match '^DJANGO_ALLOWED_HOSTS=') { $hosts = ($_ -split '=', 2)[1]; 'DJANGO_ALLOWED_HOSTS=' + $hosts + ',' + ('%NGROK_URL%' -replace '^https?://', '') } elseif ($_ -match '^CSRF_TRUSTED_ORIGINS=') { $origins = ($_ -split '=', 2)[1]; 'CSRF_TRUSTED_ORIGINS=' + $origins + ',%NGROK_URL%' } elseif ($_ -match '^DJANGO_CSRF_TRUSTED_ORIGINS=') { $origins = ($_ -split '=', 2)[1]; 'DJANGO_CSRF_TRUSTED_ORIGINS=' + $origins + ',%NGROK_URL%' } else { $_ } } | Set-Content ..\.env"

echo Environment variables updated successfully!
echo.

echo To complete the setup:
echo 1. In the deployment directory, restart the web service:
echo    cd deployment
echo    docker-compose restart web
echo.
echo 2. Access your CMS at the ngrok URL: %NGROK_URL%
echo.
echo When finished, restore your original settings:
echo 1. Restore original .env file from backup: .env.backup
echo 2. Restart the web service again
echo.
echo Important: Remember to revert these changes when you're done to avoid configuration issues
echo.
pause