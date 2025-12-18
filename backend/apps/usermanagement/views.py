from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, Role
from .serializers import UserSerializer, RoleSerializer
from django.contrib.auth.models import Group
import logging
import sys


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


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(deleted_at__isnull=True)
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrSuperuser]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminOrSuperuser]


class RoleListView(APIView):
    """Return list of roles for the admin UI."""
    permission_classes = [IsAdminOrSuperuser]

    def get(self, request):
        # Return the canonical list of roles for the UI.
        roles = Role.objects.all().order_by('name')
        data = [{'id': r.id, 'name': r.name} for r in roles]
        return Response(data)