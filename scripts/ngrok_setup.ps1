<#
.SYNOPSIS
    Setup script for hosting AGHAMazingQuestCMS on ngrok
.DESCRIPTION
    This script helps configure your AGHAMazingQuestCMS to be accessible via ngrok
    It updates environment variables and provides instructions for setup
#>

Write-Host "AGHAMazingQuestCMS - Ngrok Setup Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "Error: ngrok is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install ngrok from https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Or install via Chocolatey: choco install ngrok" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
$dockerRunning = docker ps 2>$null
if (-not $dockerRunning) {
    Write-Host "Error: Docker is not running or accessible" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and ensure it's running" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nDocker is running and services are accessible" -ForegroundColor Green

# Check if required files exist
$envFile = "..\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

Write-Host "`nPrerequisites check completed successfully!" -ForegroundColor Green

Write-Host "`nBefore proceeding, please start ngrok with the following command in another terminal:" -ForegroundColor Yellow
Write-Host "  ngrok http 8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then copy the forwarding URL (e.g., https://a1b2c3d4.ngrok.io)" -ForegroundColor Yellow

# Get ngrok URL from user
$ngrokUrl = Read-Host "`nEnter your ngrok URL (include https://)"

if ([string]::IsNullOrWhiteSpace($ngrokUrl)) {
    Write-Host "No URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# Validate URL format
if (-not ($ngrokUrl -match "^https?://")) {
    Write-Host "Invalid URL format. Please use full URL with http:// or https://" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetting up ngrok for URL: $ngrokUrl" -ForegroundColor Green

# Create backup of .env file
$envBackup = "..\.env.backup"
Copy-Item $envFile $envBackup
Write-Host "Backup created: $envBackup" -ForegroundColor Green

# Read current .env file
$envContent = Get-Content $envFile

# Process lines to update ngrok-specific values
$updatedContent = @()
$ngrokHostname = $ngrokUrl -replace "^https?://", ""

foreach ($line in $envContent) {
    if ($line -match "^WAGTAILADMIN_BASE_URL=") {
        $updatedContent += "WAGTAILADMIN_BASE_URL=$ngrokUrl"
    }
    elseif ($line -match "^DJANGO_ALLOWED_HOSTS=") {
        # Keep existing hosts and add ngrok hostname
        $existingHosts = ($line -split '=', 2)[1]
        $updatedContent += "DJANGO_ALLOWED_HOSTS=$existingHosts,$ngrokHostname"
    }
    elseif ($line -match "^CSRF_TRUSTED_ORIGINS=") {
        # Keep existing origins and add ngrok URL
        $existingOrigins = ($line -split '=', 2)[1]
        $updatedContent += "CSRF_TRUSTED_ORIGINS=$existingOrigins,$ngrokUrl"
    }
    elseif ($line -match "^DJANGO_CSRF_TRUSTED_ORIGINS=") {
        # Keep existing origins and add ngrok URL
        $existingOrigins = ($line -split '=', 2)[1]
        $updatedContent += "DJANGO_CSRF_TRUSTED_ORIGINS=$existingOrigins,$ngrokUrl"
    }
    else {
        $updatedContent += $line
    }
}

# Write updated content back to .env
$updatedContent | Set-Content $envFile

Write-Host "`nEnvironment variables updated successfully!" -ForegroundColor Green

Write-Host "`nTo complete the setup:" -ForegroundColor Yellow
Write-Host "1. Restart the web service in the deployment directory:" -ForegroundColor White
Write-Host "   cd deployment" -ForegroundColor Cyan
Write-Host "   docker-compose restart web" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Access your CMS at the ngrok URL: $ngrokUrl" -ForegroundColor White
Write-Host ""
Write-Host "When finished, restore your original settings:" -ForegroundColor Yellow
Write-Host "1. Restore original .env file from backup: .env.backup" -ForegroundColor White
Write-Host "2. Restart the web service again" -ForegroundColor White
Write-Host ""
Write-Host "Important: Remember to revert these changes when you're done to avoid configuration issues" -ForegroundColor Red