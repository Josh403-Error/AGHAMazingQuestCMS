"""
Unified API views for the headless CMS
"""
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from apps.usermanagement.models import Role
from apps.contentmanagement.models import Content, Marker, Challenge, ChallengeProgress, ContentCategory
from apps.analyticsmanagement.models import PageView, ContentInteraction, UserActivity
from .models import APIIntegration, APIIntegrationLog
from .serializers import (
    UserSerializer, 
    RoleSerializer, 
    ContentSerializer, 
    #AnalyticsSerializer,  # We'll need to update serializers as well
    DetailedContentSerializer,
    DetailedUserSerializer,
    RoleDetailedSerializer,
    MarkerSerializer,
    ChallengeSerializer,
    ChallengeProgressSerializer,
    ContentCategorySerializer,
    APIIntegrationSerializer,
    APIIntegrationLogSerializer
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


# Mobile AR Tour specific API views
class MarkerListView(generics.ListAPIView):
    """
    List all AR markers for mobile app
    """
    queryset = Marker.objects.all()
    serializer_class = MarkerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # Allow read-only for mobile app
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['content_type']
    search_fields = ['code', 'title']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']


class MarkerDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific AR marker
    """
    queryset = Marker.objects.all()
    serializer_class = MarkerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ChallengeListView(generics.ListAPIView):
    """
    List all challenges for mobile app
    """
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'points']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'points', 'title']
    ordering = ['-created_at']


class ChallengeDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific challenge
    """
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class UserChallengeProgressListView(generics.ListCreateAPIView):
    """
    List or create challenge progress for the current user
    """
    serializer_class = ChallengeProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChallengeProgress.objects.filter(user=user)

    def perform_create(self, serializer):
        # Ensure the progress is saved for the current user
        serializer.save(user=self.request.user)


class UserChallengeProgressDetailView(generics.RetrieveUpdateAPIView):
    """
    Get or update specific challenge progress for the current user
    """
    serializer_class = ChallengeProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChallengeProgress.objects.filter(user=user)


class ContentCategoryListView(generics.ListAPIView):
    """
    List all content categories
    """
    queryset = ContentCategory.objects.all()
    serializer_class = ContentCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


# API Integration management views
class APIIntegrationListView(generics.ListCreateAPIView):
    """
    List or create API integrations
    """
    queryset = APIIntegration.objects.all()
    serializer_class = APIIntegrationSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admins can manage integrations
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'is_active']
    ordering = ['-created_at']


class APIIntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update or delete a specific API integration
    """
    queryset = APIIntegration.objects.all()
    serializer_class = APIIntegrationSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admins can manage integrations


class APIIntegrationLogListView(generics.ListAPIView):
    """
    List API integration logs
    """
    queryset = APIIntegrationLog.objects.all()
    serializer_class = APIIntegrationLogSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admins can view logs
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['integration', 'response_status', 'method']
    search_fields = ['endpoint', 'ip_address']
    ordering_fields = ['request_time', 'response_status', 'response_time']
    ordering = ['-request_time']


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


# Mobile AR Tour specific endpoints
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])  # Allow read-only for mobile app
def nearby_markers(request):
    """
    Get markers near the current user's location
    Expects latitude and longitude as query parameters
    """
    latitude = request.query_params.get('latitude', None)
    longitude = request.query_params.get('longitude', None)
    
    if latitude is None or longitude is None:
        # If no location provided, return all markers
        markers = Marker.objects.all()
    else:
        # In a real implementation, we would filter by proximity
        # This is a simplified version for the headless CMS
        markers = Marker.objects.all()
    
    serializer = MarkerSerializer(markers, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_challenge(request, challenge_id):
    """
    Mark a challenge as completed by the current user
    """
    try:
        challenge = Challenge.objects.get(pk=challenge_id)
    except Challenge.DoesNotExist:
        return Response({'error': 'Challenge not found'}, status=status.HTTP_404_NOT_FOUND)
    
    progress, created = ChallengeProgress.objects.get_or_create(
        user=request.user,
        challenge=challenge,
        defaults={'score': challenge.points, 'completed_at': timezone.now()}
    )
    
    if not created and not progress.completed_at:
        progress.score = challenge.points
        progress.completed_at = timezone.now()
        progress.save()
    
    serializer = ChallengeProgressSerializer(progress)
    return Response(serializer.data)