"""
Unified API views for the headless CMS
"""
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from apps.usermanagement.models import Role
from apps.contentmanagement.models import Content
from apps.analyticsmanagement.models import PageView, ContentInteraction, UserActivity
from apps.api.serializers import (
    UserSerializer, 
    RoleSerializer, 
    ContentSerializer, 
    #AnalyticsSerializer,  # We'll need to update serializers as well
    DetailedContentSerializer,
    DetailedUserSerializer,
    RoleDetailedSerializer
)

User = get_user_model()


class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = DetailedUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_staff']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'last_login', 'email']
    ordering = ['-created_at']


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = DetailedUserSerializer
    permission_classes = [permissions.IsAuthenticated]


class RoleListView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleDetailedSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleDetailedSerializer
    permission_classes = [permissions.IsAuthenticated]


class ContentListView(generics.ListCreateAPIView):
    queryset = Content.objects.all()
    serializer_class = DetailedContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'author', 'created_at']
    search_fields = ['title', 'body', 'slug']
    ordering_fields = ['created_at', 'updated_at', 'published_at', 'title']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        # Set the author to the current user
        serializer.save(author=self.request.user)


class ContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Content.objects.all()
    serializer_class = DetailedContentSerializer
    permission_classes = [permissions.IsAuthenticated]


# Placeholder classes for analytics - need to create proper serializers
# class AnalyticsListView(generics.ListCreateAPIView):
#     queryset = Analytics.objects.all()
#     serializer_class = AnalyticsSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['metric_type', 'user', 'content', 'created_at']
#     search_fields = ['metric_name', 'metric_value']
#     ordering_fields = ['created_at', 'metric_name']
#     ordering = ['-created_at']


# class AnalyticsDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Analytics.objects.all()
#     serializer_class = AnalyticsSerializer
#     permission_classes = [permissions.IsAuthenticated]


# API endpoint to get all system statistics
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def system_stats(request):
    """
    Get overall system statistics
    """
    stats = {
        'total_users': User.objects.count(),
        'total_content': Content.objects.count(),
        'total_roles': Role.objects.count(),
        'total_page_views': PageView.objects.count(),
        'content_by_status': {
            'draft': Content.objects.filter(status='draft').count(),
            'review': Content.objects.filter(status='review').count(),
            'published': Content.objects.filter(status='published').count(),
            'archived': Content.objects.filter(status='archived').count(),
        },
        'users_by_role': [
            {
                'role': role.name,
                'count': role.users.count()
            }
            for role in Role.objects.all()
        ]
    }
    return Response(stats)


# API endpoint to get user's content
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_content(request):
    """
    Get content created by the current user
    """
    content = Content.objects.filter(author=request.user)
    serializer = ContentSerializer(content, many=True)
    return Response(serializer.data)