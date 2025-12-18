from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Role, User

User = get_user_model()


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
