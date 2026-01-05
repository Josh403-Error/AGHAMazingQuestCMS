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
    
    # Mobile AR Tour specific endpoints
    path('markers/', views.MarkerListView.as_view(), name='marker-list'),
    path('markers/<uuid:pk>/', views.MarkerDetailView.as_view(), name='marker-detail'),
    path('challenges/', views.ChallengeListView.as_view(), name='challenge-list'),
    path('challenges/<uuid:pk>/', views.ChallengeDetailView.as_view(), name='challenge-detail'),
    path('challenges/<uuid:challenge_id>/complete/', views.complete_challenge, name='challenge-complete'),
    path('user-challenges/', views.UserChallengeProgressListView.as_view(), name='user-challenge-list'),
    path('user-challenges/<uuid:pk>/', views.UserChallengeProgressDetailView.as_view(), name='user-challenge-detail'),
    path('categories/', views.ContentCategoryListView.as_view(), name='category-list'),
    path('nearby-markers/', views.nearby_markers, name='nearby-markers'),
    
    # API Integration management endpoints
    path('integrations/', views.APIIntegrationListView.as_view(), name='api-integration-list'),
    path('integrations/<uuid:pk>/', views.APIIntegrationDetailView.as_view(), name='api-integration-detail'),
    path('integration-logs/', views.APIIntegrationLogListView.as_view(), name='api-integration-log-list'),
    
    # Special endpoints
    path('system-stats/', views.system_stats, name='system-stats'),
    path('user-content/', views.user_content, name='user-content'),
]