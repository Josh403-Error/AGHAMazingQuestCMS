@echo off
echo AGHAMazingQuestCMS Service Management
echo =====================================

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="status" goto status
if "%1"=="" goto help

:help
echo.
echo Usage: %0 [start^|stop^|status]
echo.
echo Commands:
echo   start  - Start all services
echo   stop   - Stop all services
echo   status - Show status of services
goto end

:start
echo.
echo Starting all services...
cd /d "c:\Users\apcadmin\Documents\GitHub\AGHAMazingQuestCMS\deployment"
docker-compose up --build -d
echo.
echo Services started successfully!
echo.
echo Main Application: http://localhost:8080
echo Django Admin: http://localhost:8080/django-admin/
echo Wagtail CMS: http://localhost:8080/cms/
echo pgAdmin: http://localhost:5050
goto end

:stop
echo.
echo Stopping all services...
cd /d "c:\Users\apcadmin\Documents\GitHub\AGHAMazingQuestCMS\deployment"
docker-compose down
echo.
echo Services stopped.
goto end

:status
echo.
echo Status of services:
docker ps -f name=deployment
goto end

:end
pause