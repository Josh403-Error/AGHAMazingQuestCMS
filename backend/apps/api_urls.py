"""
Unified API URLs for all models
"""
from django.urls import path
from .api_views import (
    UserListView,
    UserDetailView,
    RoleListView,
    RoleDetailView,
    ContentListView,
    ContentDetailView,
    AnalyticsListView,
    AnalyticsDetailView,
    system_stats,
    user_content
)

urlpatterns = [
    # User endpoints
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Role endpoints
    path('roles/', RoleListView.as_view(), name='role-list'),
    path('roles/<uuid:pk>/', RoleDetailView.as_view(), name='role-detail'),
    
    # Content endpoints
    path('content/', ContentListView.as_view(), name='content-list'),
    path('content/<uuid:pk>/', ContentDetailView.as_view(), name='content-detail'),
    
    # Analytics endpoints
    path('analytics/', AnalyticsListView.as_view(), name='analytics-list'),
    path('analytics/<uuid:pk>/', AnalyticsDetailView.as_view(), name='analytics-detail'),
    
    # Special endpoints
    path('system-stats/', system_stats, name='system-stats'),
    path('user-content/', user_content, name='user-content'),
]