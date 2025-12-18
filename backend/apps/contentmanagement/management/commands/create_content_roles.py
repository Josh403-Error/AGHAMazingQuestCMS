from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from apps.contentmanagement.models import Content


ROLE_DEFS = {
    'Encoder': {
        'perms': ['add_content', 'view_content'],
    },
    'Editor': {
        'perms': ['add_content', 'change_content', 'view_content'],
    },
    'Approver': {
        'perms': ['change_content', 'view_content'],
    },
    'Admin': {
        'perms': ['delete_content', 'view_content'],
    },
    'Super Admin': {
        'perms': ['add_content', 'change_content', 'delete_content', 'view_content'],
    },
}


class Command(BaseCommand):
    help = 'Create content workflow roles/groups and assign basic model permissions'

    def handle(self, *args, **options):
        content_type = ContentType.objects.get_for_model(Content)

        for role_name, details in ROLE_DEFS.items():
            group, created = Group.objects.get_or_create(name=role_name)
            perms = []
            for codename in details.get('perms', []):
                try:
                    perm = Permission.objects.get(content_type=content_type, codename=codename)
                    perms.append(perm)
                except Permission.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'Permission {codename} does not exist yet.'))
            group.permissions.set(perms)
            group.save()
            self.stdout.write(self.style.SUCCESS(f'Group "{role_name}" created/updated with {len(perms)} perms.'))

        self.stdout.write(self.style.SUCCESS('Content roles setup complete.'))