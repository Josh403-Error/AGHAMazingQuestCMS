from django.apps import AppConfig


class AnalyticsManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.analyticsmanagement'
    
    def ready(self):
        import apps.analyticsmanagement.signals  # Import signals if they exist