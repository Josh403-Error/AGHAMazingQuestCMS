from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # User management endpoints
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Role management endpoints
    path('roles/', views.RoleListView.as_view(), name='role-list'),
    path('roles/<uuid:pk>/', views.RoleDetailView.as_view(), name='role-detail'),
    
    # Content management endpoints
    path('content/', views.ContentListView.as_view(), name='content-list'),
    path('content/<uuid:pk>/', views.ContentDetailView.as_view(), name='content-detail'),
    
    # Mobile AR Tour specific endpoints
    path('markers/', views.MarkerListView.as_view(), name='marker-list'),
    path('markers/<uuid:pk>/', views.MarkerDetailView.as_view(), name='marker-detail'),
    path('challenges/', views.ChallengeListView.as_view(), name='challenge-list'),
    path('challenges/<uuid:pk>/', views.ChallengeDetailView.as_view(), name='challenge-detail'),
    
    # Challenge progress endpoints
    path('challenge-progress/', views.UserChallengeProgressListView.as_view(), name='challenge-progress-list'),
    path('challenge-progress/<uuid:pk>/', views.UserChallengeProgressDetailView.as_view(), name='challenge-progress-detail'),
    
    # Content categories
    path('categories/', views.ContentCategoryListView.as_view(), name='category-list'),
    
    # Mobile media content endpoints
    path('mobile-media/', views.MobileMediaContentViewSet.as_view({'get': 'list', 'post': 'create'}), name='mobile-media-list'),
    path('mobile-media/<uuid:pk>/', views.MobileMediaContentDetailView.as_view(), name='mobile-media-detail'),
    
    # API Integration endpoints
    path('api-integrations/', views.APIIntegrationListView.as_view(), name='api-integration-list'),
    path('api-integrations/<uuid:pk>/', views.APIIntegrationDetailView.as_view(), name='api-integration-detail'),
    path('api-integration-logs/', views.APIIntegrationLogListView.as_view(), name='api-integration-log-list'),
    
    # System statistics
    path('system-stats/', views.system_stats, name='system-stats'),
    path('user-content/', views.user_content, name='user-content'),
    path('nearby-markers/', views.nearby_markers, name='nearby-markers'),
    path('complete-challenge/<uuid:challenge_id>/', views.complete_challenge, name='complete-challenge'),
]