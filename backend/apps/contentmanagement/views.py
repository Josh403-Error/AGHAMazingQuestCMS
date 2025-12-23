from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Content, ContentCategory, ContentAnalytics, ContentApproval, 
    MediaLibrary, ContentMedia, Challenge, Marker, ChallengeProgress, 
    Feedback, ChatSession
)
from .serializers import (
    ContentSerializer, ContentCategorySerializer, ContentAnalyticsSerializer,
    ContentApprovalSerializer, MediaLibrarySerializer, ContentMediaSerializer,
    ChallengeSerializer, MarkerSerializer, ChallengeProgressSerializer,
    FeedbackSerializer, ChatSessionSerializer
)
# from .permissions import IsOwnerOrReadOnly  # Removed since it doesn't exist
from apps.analyticsmanagement.models import UserActivity, PageView

User = get_user_model()


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Only allow users to see their own content if not staff
        if not self.request.user.is_staff:
            queryset = queryset.filter(author=self.request.user)
        return queryset.filter(deleted_at__isnull=True)

    def perform_create(self, serializer):
        # Create a ContentAnalytics object first
        analytics = ContentAnalytics.objects.create()
        # Save the content with the author and analytics
        serializer.save(author=self.request.user, analytics=analytics)


class ContentCategoryViewSet(viewsets.ModelViewSet):
    queryset = ContentCategory.objects.all()
    serializer_class = ContentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ContentAnalyticsViewSet(viewsets.ModelViewSet):
    queryset = ContentAnalytics.objects.all()
    serializer_class = ContentAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]


class ContentApprovalViewSet(viewsets.ModelViewSet):
    queryset = ContentApproval.objects.all()
    serializer_class = ContentApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Approver can only see content assigned to them
        if not self.request.user.is_staff:
            queryset = queryset.filter(approver=self.request.user)
        return queryset


class MediaLibraryViewSet(viewsets.ModelViewSet):
    queryset = MediaLibrary.objects.all()
    serializer_class = MediaLibrarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)


class ContentMediaViewSet(viewsets.ModelViewSet):
    queryset = ContentMedia.objects.all()
    serializer_class = ContentMediaSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class MarkerViewSet(viewsets.ModelViewSet):
    queryset = Marker.objects.all()
    serializer_class = MarkerSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChallengeProgressViewSet(viewsets.ModelViewSet):
    queryset = ChallengeProgress.objects.all()
    serializer_class = ChallengeProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Users can only see their own progress
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatSessionViewSet(viewsets.ModelViewSet):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Users can only see their own chat sessions
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset


@login_required
def custom_dashboard(request):
    """
    Custom dashboard view with analytics and content stats
    """
    # Get content stats
    total_content_count = Content.objects.filter(deleted_at__isnull=True).count()
    
    # Content status breakdown
    content_status = Content.objects.filter(
        deleted_at__isnull=True
    ).values('status').annotate(count=Count('status'))
    
    # Calculate percentages for content status
    content_status_list = []
    for item in content_status:
        status_name = item['status']
        count = item['count']
        percentage = 0
        if total_content_count > 0:
            percentage = round((count / total_content_count) * 100, 2)
        content_status_list.append({
            'status': status_name,
            'count': count,
            'percentage': percentage
        })
    
    # User stats
    total_users_count = User.objects.count()
    
    # Pending reviews
    pending_reviews_count = Content.objects.filter(
        status__in=['pending_review', 'reviewed']
    ).count()
    
    # Page views this month
    thirty_days_ago = timezone.now() - timedelta(days=30)
    page_views_count = PageView.objects.filter(
        timestamp__gte=thirty_days_ago
    ).count()
    
    # Recent activities
    recent_activities = UserActivity.objects.select_related('user').order_by('-timestamp')[:10]
    
    context = {
        'total_content_count': total_content_count,
        'total_users_count': total_users_count,
        'pending_reviews_count': pending_reviews_count,
        'page_views_count': page_views_count,
        'content_status_list': content_status_list,
        'recent_activities': recent_activities,
    }
    
    return render(request, 'wagtail/admin/dashboard.html', context)