@echo off
REM Batch file to restore original environment after ngrok usage

echo AGHAMazingQuestCMS - Ngrok Restore
echo ==================================

REM Check if backup file exists
if not exist "..\.env.backup" (
    echo Error: Backup file .env.backup not found
    echo Make sure you ran the ngrok setup script first
    pause
    exit /b 1
)

echo Restoring original .env file...
copy ..\.env.backup ..\.env

if errorlevel 1 (
    echo Error: Failed to restore .env file
    pause
    exit /b 1
)

echo Original .env file restored successfully!
echo.

echo To complete the restore:
echo 1. In the deployment directory, restart the web service:
echo    cd deployment
echo    docker-compose restart web
echo.
echo 2. Your system is now back to original configuration
echo.
echo You can now access your CMS normally at http://localhost:8080
echo.

pause