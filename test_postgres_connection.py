#!/usr/bin/env python3
"""
Script to test PostgreSQL connection
"""
import os
import sys
import django
from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
os.environ['DB_ENGINE'] = 'postgres'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '5433'  # Our mapped port

django.setup()

def test_db_connection():
    """Test database connection"""
    db_conn = connections['default']
    try:
        c = db_conn.cursor()
        c.execute("SELECT version();")
        result = c.fetchone()
        print("✅ Successfully connected to PostgreSQL!")
        print(f"PostgreSQL version: {result[0]}")
        return True
    except OperationalError as e:
        print(f"❌ Failed to connect to PostgreSQL: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Testing PostgreSQL connection...")
    success = test_db_connection()
    if success:
        print("\n🎉 PostgreSQL integration test PASSED!")
        sys.exit(0)
    else:
        print("\n💥 PostgreSQL integration test FAILED!")
        sys.exit(1)