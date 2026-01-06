from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection


class Command(BaseCommand):
    help = 'Mark specific Wagtail migrations as run to bypass dependency issues'

    def handle(self, *args, **options):
        self.stdout.write('Faking specific Wagtail migrations to bypass dependency issues...')
        
        # We need to fake the specific migrations that are causing dependency issues
        migrations_to_fake = [
            ('wagtailadmin', '0001_create_admin_access_permissions'),
            ('wagtaildocs', '0011_add_choose_permissions'),
        ]
        
        for app, migration in migrations_to_fake:
            try:
                # Try to fake the specific migration
                call_command('migrate', app, migration, '--fake', verbosity=2)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully faked migration {app}.{migration}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'Could not fake migration {app}.{migration}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Finished attempting to fake problematic migrations!')
        )

# This file has been removed as the migration issue is now handled in the entrypoint script
# The redundant management commands were causing confusion and potential conflicts
