from rest_framework import serializers
from .models import Content
from apps.usermanagement.serializers import UserSerializer


class ContentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField(read_only=True)
    # Expose related user objects (read-only) so the frontend can show names
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Content
        fields = [
            'id', 'title', 'body', 'file_path', 'status',
            'author', 'created_at', 'published_at', 'deleted_at',
            'file_url', 'excerpt', 'content_type'
        ]
        read_only_fields = ['status', 'author', 'created_at', 'published_at', 'deleted_at']

    def create(self, validated_data):
        # file uploads handled by DRF parser
        return super().create(validated_data)

    def get_file_url(self, obj):
        """Return an absolute URL for the attached file if present.

        Uses request in context when available so the frontend can get a usable URL.
        """
        try:
            if not obj.file_path:
                return None
            request = self.context.get('request') if self.context else None
            url = obj.file_path
            if request:
                return request.build_absolute_uri(url)
            # Fallback: if url is already absolute, return it; else prefix origin
            if url.startswith('http'):
                return url
            return f"{request.scheme if request else 'https'}://{request.get_host() if request else ''}{url}"
        except Exception:
            return None