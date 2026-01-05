"""
API serializers for the unified headless CMS
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.usermanagement.models import Role
from apps.contentmanagement.models import Content, Marker, Challenge, ChallengeProgress, ContentCategory, MediaLibrary
from .models import APIIntegration, APIIntegrationLog
# from apps.analyticsmanagement.models import Analytics  # Removed since model doesn't exist

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'avatar_url', 'role', 'role_name', 'is_staff', 'is_active', 
            'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_login']


class ContentSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Content
        fields = [
            'id', 'title', 'slug', 'body', 'status', 'author', 
            'author_email', 'author_full_name', 'created_at', 'updated_at',
            'published_at', 'metadata'
        ]
        read_only_fields = ['created_at', 'updated_at', 'author']
    
    def get_author_full_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}"


# class AnalyticsSerializer(serializers.ModelSerializer):  # Removed since model doesn't exist
#     class Meta:
#         model = Analytics
#         fields = '__all__'


# Detailed serializers for specific use cases
class DetailedContentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    role = RoleSerializer(source='author.role', read_only=True)
    
    class Meta:
        model = Content
        fields = '__all__'


class DetailedUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    content_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'avatar_url', 'role', 'is_staff', 'is_active', 
            'last_login', 'created_at', 'updated_at', 'content_count'
        ]
    
    def get_content_count(self, obj):
        return obj.content_set.filter(deleted_at__isnull=True).count()


class RoleDetailedSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Role
        fields = '__all__'
    
    def get_user_count(self, obj):
        return obj.users.filter(deleted_at__isnull=True).count()


# Mobile AR Tour specific serializers
class ContentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = '__all__'


class MarkerSerializer(serializers.ModelSerializer):
    content_title = serializers.CharField(source='content.title', read_only=True)
    content_body = serializers.CharField(source='content.body', read_only=True)
    
    class Meta:
        model = Marker
        fields = [
            'id', 'code', 'latitude', 'longitude', 'content_url',
            'content_title', 'content_body', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'


class ChallengeProgressSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer(read_only=True)
    
    class Meta:
        model = ChallengeProgress
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


# API Integration serializers
class APIIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIIntegration
        fields = '__all__'
        read_only_fields = ('id', 'api_key', 'created_at', 'updated_at')

    def create(self, validated_data):
        # The model will generate the API key automatically
        return APIIntegration.objects.create(**validated_data)


class APIIntegrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIIntegrationLog
        fields = '__all__'
        read_only_fields = ('id', 'request_time')


# Mobile Media Content specific serializers
class MobileMediaContentSerializer(serializers.ModelSerializer):
    """
    Serializer for mobile media content - focuses on media files instead of web pages
    """
    media_url = serializers.SerializerMethodField()
    uploader_email = serializers.EmailField(source='uploader.email', read_only=True)
    uploader_full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaLibrary
        fields = [
            'id', 'file_name', 'file_path', 'file_size', 'mime_type',
            'description', 'tags', 'created_at', 'updated_at',
            'uploader', 'uploader_email', 'uploader_full_name', 'media_url'
        ]
        read_only_fields = ['created_at', 'updated_at', 'uploader']
    
    def get_media_url(self, obj):
        # Return the actual file URL instead of just the path
        request = self.context.get('request')
        if obj.file_path and request:
            return request.build_absolute_uri(obj.file_path)
        return obj.file_path
    
    def get_uploader_full_name(self, obj):
        return f"{obj.uploader.first_name} {obj.uploader.last_name}"


class CreateMobileMediaContentSerializer(serializers.ModelSerializer):
    """
    Serializer for creating mobile media content
    """
    class Meta:
        model = MediaLibrary
        fields = [
            'file_name', 'file_path', 'file_size', 'mime_type',
            'description', 'tags'
        ]
    
    def create(self, validated_data):
        # The uploader will be set from the view
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploader'] = request.user
        return MediaLibrary.objects.create(**validated_data)