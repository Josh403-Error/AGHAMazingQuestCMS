from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import (
    Content, ContentCategory, ContentAnalytics, ContentApproval,
    MediaLibrary, ContentMedia, Challenge, Marker,
    ChallengeProgress, Feedback, ChatSession
)
from apps.usermanagement.models import User
from .serializers import (
    ContentSerializer, ContentCategorySerializer, ContentAnalyticsSerializer,
    ContentApprovalSerializer, MediaLibrarySerializer, ContentMediaSerializer,
    ChallengeSerializer, MarkerSerializer, ChallengeProgressSerializer,
    FeedbackSerializer, ChatSessionSerializer
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


class IsAdminOrSuperuser(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        # Allow only superusers or users in Admin/Super Admin groups
        if request.user.is_superuser:
            return True
        # Check user role
        if hasattr(request.user, 'role') and request.user.role:
            return request.user.role.name in ['Admin', 'Super Admin']
        return False


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.filter(deleted_at__isnull=True)
    serializer_class = ContentSerializer
    permission_classes = [IsAdminOrSuperuser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'content_type', 'author']
    search_fields = ['title', 'body']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        # Set the author to the current user
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        content = self.get_object()
        content.status = 'approved'
        content.published_at = timezone.now()
        content.save()
        return Response({'status': 'published'})

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        content = self.get_object()
        content.soft_delete()
        return Response({'status': 'deleted'})

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_content(self, request, pk=None):
        content = self.get_object()
        content.status = 'approved'
        content.approved_at = timezone.now()
        content.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], url_path='deny')
    def deny_content(self, request, pk=None):
        content = self.get_object()
        content.status = 'denied'
        content.denied_at = timezone.now()
        content.save()
        return Response({'status': 'denied'})


class ContentCategoryViewSet(viewsets.ModelViewSet):
    queryset = ContentCategory.objects.filter(deleted_at__isnull=True)
    serializer_class = ContentCategorySerializer
    permission_classes = [IsAdminOrSuperuser]


class ContentAnalyticsViewSet(viewsets.ModelViewSet):
    queryset = ContentAnalytics.objects.all()
    serializer_class = ContentAnalyticsSerializer
    permission_classes = [IsAdminOrSuperuser]


class ContentApprovalViewSet(viewsets.ModelViewSet):
    queryset = ContentApproval.objects.filter(deleted_at__isnull=True)
    serializer_class = ContentApprovalSerializer
    permission_classes = [IsAdminOrSuperuser]


class MediaLibraryViewSet(viewsets.ModelViewSet):
    queryset = MediaLibrary.objects.filter(deleted_at__isnull=True)
    serializer_class = MediaLibrarySerializer
    permission_classes = [IsAdminOrSuperuser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['file_name', 'description']


class ContentMediaViewSet(viewsets.ModelViewSet):
    queryset = ContentMedia.objects.all()
    serializer_class = ContentMediaSerializer
    permission_classes = [IsAdminOrSuperuser]


class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.filter(deleted_at__isnull=True)
    serializer_class = ChallengeSerializer
    permission_classes = [IsAdminOrSuperuser]


class MarkerViewSet(viewsets.ModelViewSet):
    queryset = Marker.objects.filter(deleted_at__isnull=True)
    serializer_class = MarkerSerializer
    permission_classes = [IsAdminOrSuperuser]


class ChallengeProgressViewSet(viewsets.ModelViewSet):
    queryset = ChallengeProgress.objects.all()
    serializer_class = ChallengeProgressSerializer
    permission_classes = [IsAdminOrSuperuser]


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.filter(deleted_at__isnull=True)
    serializer_class = FeedbackSerializer
    permission_classes = [IsAdminOrSuperuser]


class ChatSessionViewSet(viewsets.ModelViewSet):
    queryset = ChatSession.objects.filter(deleted_at__isnull=True)
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAdminOrSuperuser]