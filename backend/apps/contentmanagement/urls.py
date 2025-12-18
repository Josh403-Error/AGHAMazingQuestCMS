from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContentViewSet, ContentCategoryViewSet, ContentAnalyticsViewSet,
    ContentApprovalViewSet, MediaLibraryViewSet, ContentMediaViewSet,
    ChallengeViewSet, MarkerViewSet, ChallengeProgressViewSet,
    FeedbackViewSet, ChatSessionViewSet
)

router = DefaultRouter()
router.register(r'content', ContentViewSet, basename='content')
router.register(r'categories', ContentCategoryViewSet, basename='content-category')
router.register(r'analytics', ContentAnalyticsViewSet, basename='content-analytics')
router.register(r'approvals', ContentApprovalViewSet, basename='content-approval')
router.register(r'media', MediaLibraryViewSet, basename='media-library')
router.register(r'content-media', ContentMediaViewSet, basename='content-media')
router.register(r'challenges', ChallengeViewSet, basename='challenge')
router.register(r'markers', MarkerViewSet, basename='marker')
router.register(r'challenge-progress', ChallengeProgressViewSet, basename='challenge-progress')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'chat-sessions', ChatSessionViewSet, basename='chat-session')

urlpatterns = [
    path('', include(router.urls)),
]