from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .permissions import IsContentWorkflowAllowed
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Content
from .serializers import ContentSerializer
from .permissions import user_in_group

class GamePublishedContentList(APIView):
    """Authenticated endpoint to list published content for mobile games.

    GET /api/game/content/ -> returns published items (status=published) with absolute file_url
    Mobile clients must include a valid token (e.g. JWT) in the Authorization header.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        qs = Content.objects.filter(deleted_at__isnull=True, status=Content.Status.PUBLISHED).order_by('-published_at')
        serializer = ContentSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.filter(deleted_at__isnull=True).all()
    serializer_class = ContentSerializer
    # Require authentication and check role-based permissions for actions
    permission_classes = [IsAuthenticated, IsContentWorkflowAllowed]

    def get_queryset(self):
        qs = Content.objects.filter(deleted_at__isnull=True)
        status_q = self.request.query_params.get('status')
        if status_q:
            qs = qs.filter(status=status_q)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        # When a new content item is uploaded by an Encoder/Editor, set its status
        # to 'edited' (i.e. ready for final editing) and record who created it.
        # Save with the new workflow initial state: For editing
        serializer.save(author=self.request.user, status=Content.Status.DRAFT)

    def create(self, request, *args, **kwargs):
        """Create endpoint returns a friendly message and the created Content ID.

        Successful response example:
        { "message": "Content Uploaded", "id": 123, "item": { ... } }

        On failure, normal DRF validation errors are returned and the frontend
        will surface "Content Failed to Upload" to the user.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        # serializer.instance is the saved Content
        response_data = {
            'message': 'Content Uploaded',
            'id': serializer.instance.id,
            'item': self.get_serializer(serializer.instance).data,
        }
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        obj = serializer.save()

    @action(detail=True, methods=['post'])
    def send_for_approval(self, request, pk=None):
        item = get_object_or_404(Content, pk=pk, deleted_at__isnull=True)
        item.send_for_approval(user=request.user)
        return Response(self.get_serializer(item).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        item = get_object_or_404(Content, pk=pk, deleted_at__isnull=True)
        # Only users in Approver group or superusers can approve
        if not (request.user.is_superuser or user_in_group(request.user, 'Approver')):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        item.approve(user=request.user)
        return Response(self.get_serializer(item).data)

    @action(detail=True, methods=['post'])
    def deny(self, request, pk=None):
        """Deny approval: move item back to 'For editing' so editors can modify and re-submit."""
        item = get_object_or_404(Content, pk=pk, deleted_at__isnull=True)
        # Only approvers or superusers can deny
        if not (request.user.is_superuser or user_in_group(request.user, 'Approver')):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        # clear approval metadata and move back to editing
        item.status = Content.STATUS_FOR_EDITING
        item.approved_by = None
        item.approved_at = None
        # record that it was sent back for editing
        item.edited_at = item.edited_at or None
        item.save(update_fields=['status', 'approved_by', 'approved_at', 'edited_at'])
        return Response(self.get_serializer(item).data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        item = get_object_or_404(Content, pk=pk, deleted_at__isnull=True)
        # Only users in Approver group or superusers can publish
        if not (request.user.is_superuser or user_in_group(request.user, 'Approver')):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        item.publish(user=request.user)
        return Response(self.get_serializer(item).data)

    def destroy(self, request, *args, **kwargs):
        # soft delete
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
from django.shortcuts import render

# Create your views here.
