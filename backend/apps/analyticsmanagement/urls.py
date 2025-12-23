from django.urls import path
from django.views.generic import TemplateView
from . import views
from .admin_views import AnalyticsDashboardView

app_name = 'analyticsmanagement'

urlpatterns = [
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics_dashboard'),
    path('api/data/', views.analytics_dashboard_api, name='analytics_api'),
]