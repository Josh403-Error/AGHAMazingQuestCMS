from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.contentmanagement.models import MediaLibrary
from apps.usermanagement.models import Role

User = get_user_model()


class MobileMediaContentAPITest(APITestCase):
    def setUp(self):
        # Create a role for testing
        self.role, created = Role.objects.get_or_create(name='Test Role', description='Test Role Description')
        
        # Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123',
            role=self.role
        )
        
        # Create another user to test ownership
        self.other_user = User.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password='testpass123',
            role=self.role
        )
        
        # Create a media library entry
        self.media_item = MediaLibrary.objects.create(
            file_name='test_image.jpg',
            file_path='/media/test_image.jpg',
            file_size=102400,  # 100KB
            mime_type='image/jpeg',
            description='Test image description',
            tags=['test', 'image'],
            uploader=self.user
        )
        
        # URLs for testing
        self.media_list_url = reverse('api:mobile-media-list')
        self.media_detail_url = reverse('api:mobile-media-detail', kwargs={'pk': self.media_item.id})
        
    def test_get_media_list_authenticated(self):
        """Test that authenticated users can get media list"""
        self.client.login(email='test@example.com', password='testpass123')
        
        response = self.client.get(self.media_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        
    def test_get_media_list_unauthenticated(self):
        """Test that unauthenticated users can get media list (read-only)"""
        response = self.client.get(self.media_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_create_media_item_authenticated(self):
        """Test that authenticated users can create media items"""
        self.client.login(email='test@example.com', password='testpass123')
        
        data = {
            'file_name': 'new_image.jpg',
            'file_path': '/media/new_image.jpg',
            'file_size': 204800,  # 200KB
            'mime_type': 'image/jpeg',
            'description': 'New test image',
            'tags': ['new', 'image']
        }
        
        response = self.client.post(self.media_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify the media item was created
        self.assertEqual(MediaLibrary.objects.count(), 2)
        
    def test_get_media_detail(self):
        """Test that users can get a specific media item"""
        response = self.client.get(self.media_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['file_name'], 'test_image.jpg')