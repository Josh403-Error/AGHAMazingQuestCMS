"""
Script to temporarily update environment variables for ngrok hosting
This script will:
1. Backup the current .env file
2. Update the .env file with ngrok-specific settings
3. Provide instructions for ngrok setup
"""
import os
import shutil
from pathlib import Path

def backup_env_file():
    """Create a backup of the current .env file"""
    env_path = Path("../.env")
    backup_path = Path("../.env.backup")
    
    if env_path.exists():
        shutil.copy2(env_path, backup_path)
        print(f"Backup created: {backup_path}")
        return True
    else:
        print("Error: .env file not found")
        return False

def update_env_for_ngrok(ngrok_url):
    """Update the .env file with ngrok-specific settings"""
    env_path = Path("../.env")
    
    if not env_path.exists():
        print("Error: .env file not found")
        return False
    
    # Read current .env file
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Process lines to update ngrok-specific values
    updated_lines = []
    ngrok_hostname = ngrok_url.replace("https://", "").replace("http://", "")
    
    for line in lines:
        if line.startswith("WAGTAILADMIN_BASE_URL="):
            updated_lines.append(f"WAGTAILADMIN_BASE_URL={ngrok_url}\n")
        elif line.startswith("DJANGO_ALLOWED_HOSTS="):
            # Keep existing hosts and add ngrok hostname
            existing_hosts = line.split("=", 1)[1].strip()
            updated_lines.append(f"DJANGO_ALLOWED_HOSTS={existing_hosts},{ngrok_hostname}\n")
        elif line.startswith("CSRF_TRUSTED_ORIGINS="):
            # Keep existing origins and add ngrok URL
            existing_origins = line.split("=", 1)[1].strip()
            updated_lines.append(f"CSRF_TRUSTED_ORIGINS={existing_origins},{ngrok_url}\n")
        elif line.startswith("DJANGO_CSRF_TRUSTED_ORIGINS="):
            # Keep existing origins and add ngrok URL
            existing_origins = line.split("=", 1)[1].strip()
            updated_lines.append(f"DJANGO_CSRF_TRUSTED_ORIGINS={existing_origins},{ngrok_url}\n")
        else:
            updated_lines.append(line)
    
    # Write updated content back to .env
    with open(env_path, 'w') as f:
        f.writelines(updated_lines)
    
    print(f"Environment variables updated for ngrok: {ngrok_url}")
    return True

def restore_env_backup():
    """Restore the original .env file from backup"""
    env_path = Path("../.env")
    backup_path = Path("../.env.backup")
    
    if backup_path.exists():
        shutil.copy2(backup_path, env_path)
        print("Original .env file restored")
        return True
    else:
        print("Error: Backup file not found")
        return False

def main():
    print("AGHAMazingQuestCMS - Ngrok Setup Script")
    print("========================================")
    
    # Ask for ngrok URL
    print("\nBefore proceeding, please start ngrok with:")
    print("  ngrok http 8080")
    print("\nThen copy the forwarding URL (e.g., https://a1b2c3d4.ngrok.io)")
    
    ngrok_url = input("\nEnter your ngrok URL: ").strip()
    
    if not ngrok_url:
        print("No URL provided. Exiting.")
        return
    
    # Validate URL format
    if not ngrok_url.startswith(('http://', 'https://')):
        print("Invalid URL format. Please use full URL with http:// or https://")
        return
    
    print(f"\nSetting up ngrok for URL: {ngrok_url}")
    
    # Backup current .env
    if not backup_env_file():
        return
    
    # Update .env for ngrok
    if not update_env_for_ngrok(ngrok_url):
        print("Failed to update environment variables. Restoring backup...")
        restore_env_backup()
        return
    
    print("\nEnvironment variables have been updated successfully!")
    print("\nTo complete the setup:")
    print("1. Restart the web service: docker-compose restart web")
    print("2. Access your CMS at the ngrok URL")
    print("\nWhen finished, run this script with 'restore' argument to revert changes")
    
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "restore":
        restore_env_backup()
    else:
        main()