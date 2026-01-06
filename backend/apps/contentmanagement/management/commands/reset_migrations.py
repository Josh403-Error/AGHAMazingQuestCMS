from django.db import connection
from django.core.management.base import BaseCommand
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = 'Reset problematic Wagtail migration records if the table exists'

    def handle(self, *args, **options):
        self.stdout.write('Resetting problematic migration records...')
        
        try:
            with connection.cursor() as cursor:
                # Check if django_migrations table exists
                cursor.execute("""
                    SELECT to_regclass('django_migrations');
                """)
                
                table_exists = cursor.fetchone()[0] is not None
                
                if table_exists:
                    # Check if the problematic migration records exist before trying to delete them
                    cursor.execute("""
                        SELECT COUNT(*) FROM django_migrations 
                        WHERE app = 'wagtaildocs' 
                        AND name = '0011_add_choose_permissions';
                    """)
                    
                    if cursor.fetchone()[0] > 0:
                        # Delete the problematic migration records
                        cursor.execute("""
                            DELETE FROM django_migrations 
                            WHERE app = 'wagtaildocs' 
                            AND name = '0011_add_choose_permissions';
                        """)
                        
                        self.stdout.write(
                            self.style.SUCCESS('Successfully reset wagtaildocs.0011_add_choose_permissions')
                        )
                    else:
                        self.stdout.write('wagtaildocs.0011_add_choose_permissions not found, skipping')
                    
                    # Also check and delete any other wagtailadmin migration records that might be problematic
                    cursor.execute("""
                        SELECT COUNT(*) FROM django_migrations 
                        WHERE app = 'wagtailadmin' 
                        AND name LIKE '0001%';
                    """)
                    
                    if cursor.fetchone()[0] > 0:
                        cursor.execute("""
                            DELETE FROM django_migrations 
                            WHERE app = 'wagtailadmin' 
                            AND name LIKE '0001%';
                        """)
                        
                        self.stdout.write(
                            self.style.SUCCESS('Successfully reset wagtailadmin problematic records')
                        )
                    else:
                        self.stdout.write('No problematic wagtailadmin records found, skipping')
                else:
                    self.stdout.write('django_migrations table does not exist yet, skipping reset')
        
        except OperationalError as e:
            self.stdout.write(f'Could not access database, likely still being created, skipping reset: {e}')
        
        self.stdout.write(
            self.style.SUCCESS('Migration reset attempt completed!')
        )
# This file has been removed as the migration issue is now handled in the entrypoint script
# The redundant management commands were causing confusion and potential conflicts
