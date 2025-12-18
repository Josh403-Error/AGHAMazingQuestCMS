from rest_framework import serializers
from .models import (
    Content, ContentCategory, ContentAnalytics, ContentApproval, 
    MediaLibrary, ContentMedia, Challenge, Marker, 
    ChallengeProgress, Feedback, ChatSession
)
from apps.usermanagement.models import User, Role


class ContentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = '__all__'


class ContentAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentAnalytics
        fields = '__all__'


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = '__all__'
        read_only_fields = ('author',)


class ContentApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentApproval
        fields = '__all__'


class MediaLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaLibrary
        fields = '__all__'


class ContentMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentMedia
        fields = '__all__'


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'


class MarkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marker
        fields = '__all__'


class ChallengeProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeProgress
        fields = '__all__'


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = '__all__'


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'avatar_url', 'is_active', 'metadata', 'last_login_at',
            'role', 'role_name', 'created_at', 'updated_at'
        )
        read_only_fields = ('last_login_at', 'created_at', 'updated_at')

    def create(self, validated_data):
        # Handle password properly
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        # Handle password properly
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance