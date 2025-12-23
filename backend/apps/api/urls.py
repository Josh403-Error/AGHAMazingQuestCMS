"""
API URLs for the unified headless CMS
"""
from django.urls import path
from . import views

urlpatterns = [
    # User endpoints
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Role endpoints
    path('roles/', views.RoleListView.as_view(), name='role-list'),
    path('roles/<uuid:pk>/', views.RoleDetailView.as_view(), name='role-detail'),
    
    # Content endpoints
    path('content/', views.ContentListView.as_view(), name='content-list'),
    path('content/<uuid:pk>/', views.ContentDetailView.as_view(), name='content-detail'),
    
    
    # Special endpoints
    path('system-stats/', views.system_stats, name='system-stats'),
    path('user-content/', views.user_content, name='user-content'),
]