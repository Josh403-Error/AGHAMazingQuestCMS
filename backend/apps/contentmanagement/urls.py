from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentViewSet
from .views import GamePublishedContentList

router = DefaultRouter()
router.register(r'items', ContentViewSet, basename='content')

urlpatterns = [
    path('', include(router.urls)),
    path('game/content/', GamePublishedContentList.as_view(), name='game-published-content'),
]