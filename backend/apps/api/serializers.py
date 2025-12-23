"""
API serializers for the unified headless CMS
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.usermanagement.models import Role
from apps.contentmanagement.models import Content
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