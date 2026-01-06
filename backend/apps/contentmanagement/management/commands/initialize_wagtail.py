from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection


class Command(BaseCommand):
    help = 'Initialize Wagtail CMS with proper migration handling'

    def handle(self, *args, **options):
        self.stdout.write('Initializing Wagtail CMS...')
        
        # First, fake the initial wagtail migrations to avoid dependency issues
        wagtail_apps = [
            'wagtailcore',
            'wagtailadmin',
            'wagtaildocs',
            'wagtailimages',
            'wagtailusers',
            'wagtailroutablepage',
            'wagtailredirects',
            'wagtailforms',
            'wagtailsearch',
            'wagtailcontrib.settings',
            'wagtail.contrib.modeladmin',
            'wagtail.contrib.forms',
            'wagtail.contrib.redirects',
            'wagtail.contrib.sitemaps',
        ]

        # Run migrate on non-wagtail apps first
        self.stdout.write('Running migrations for non-Wagtail apps first...')
        call_command('migrate', 'contenttypes', verbosity=0)
        call_command('migrate', 'auth', verbosity=0)
        call_command('migrate', 'sessions', verbosity=0)
        call_command('migrate', 'admin', verbosity=0)
        call_command('migrate', 'sites', verbosity=0)
        call_command('migrate', 'taggit', verbosity=0)

        # Handle wagtail migrations carefully
        self.stdout.write('Handling Wagtail migrations...')
        for app in wagtail_apps:
            try:
                # Try to migrate each wagtail app individually
                call_command('migrate', app, verbosity=0)
                self.stdout.write(f'Successfully migrated {app}')
            except Exception as e:
                self.stdout.write(f'Could not migrate {app}, error: {str(e)}')
                # If normal migration fails, try with --fake-initial
                try:
                    call_command('migrate', app, '--fake-initial', verbosity=0)
                    self.stdout.write(f'Successfully faked initial migration for {app}')
                except Exception as e2:
                    self.stdout.write(f'Even faking initial migration failed for {app}: {str(e2)}')

        # Run all remaining migrations
        self.stdout.write('Running remaining migrations...')
        call_command('migrate', verbosity=0)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully initialized Wagtail CMS!')
        )