from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MaxLengthValidator
import uuid
from django.contrib.postgres.fields import ArrayField
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.images import get_image_model
from wagtail.documents import get_document_model


class BaseEntity(models.Model):
    """
    Base entity with UUID primary key, timestamps, and soft delete support
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        """Soft delete the entity"""
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restore a soft deleted entity"""
        self.deleted_at = None
        self.save()

    def is_deleted(self):
        """Check if entity is soft deleted"""
        return self.deleted_at is not None


class ContentCategory(BaseEntity):
    """
    Hierarchical content category with path for efficient queries
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    path = models.TextField(blank=True)  # Simplified path storage

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Generate path based on hierarchy"""
        if self.parent:
            self.path = f"{self.parent.path}.{self.id}" if self.parent.path else str(self.parent.id)
        else:
            self.path = str(self.id)
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'content_category'
        unique_together = ('name', 'parent')


class ContentAnalytics(BaseEntity):
    """
    Analytics data for content
    """
    view_count = models.IntegerField(default=0)
    engagement_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)
    report_generated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'content_analytics'
        verbose_name_plural = "Content analytics"


class ContentStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    PENDING_REVIEW = 'pending_review', 'Pending Review'
    REVIEWED = 'reviewed', 'Reviewed'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class ContentTypeEnum(models.TextChoices):
    AR_MARKER = 'ar_marker', 'AR Marker'
    VIDEO = 'video', 'Video'
    MUSIC = 'music', 'Music'
    IMAGE = 'image', 'Image'


class Content(BaseEntity):
    """
    Main content model
    """
    title = models.CharField(max_length=255)
    body = models.TextField()
    excerpt = models.TextField(validators=[MaxLengthValidator(500)])
    file_path = models.TextField()
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.DRAFT)
    content_type = models.CharField(max_length=20, choices=ContentTypeEnum.choices)
    published_at = models.DateTimeField(null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name='contents')
    category = models.ForeignKey(ContentCategory, on_delete=models.SET_NULL, null=True, blank=True)
    analytics = models.OneToOneField(ContentAnalytics, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'content'


class ApprovalStatus(models.TextChoices):
    APPROVED = 'approved', 'Approved'
    PENDING = 'pending', 'Pending'
    REJECTED = 'rejected', 'Rejected'


class ContentApproval(BaseEntity):
    """
    Content approval tracking
    """
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)
    approved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING)
    comments = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'content_approval'


class MediaLibrary(BaseEntity):
    """
    Media library for storing files
    """
    file_name = models.TextField()
    file_path = models.TextField(unique=True)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list)
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)

    class Meta:
        db_table = 'media_library'
        verbose_name_plural = "Media library"

    def __str__(self):
        return self.file_name


class ContentMedia(models.Model):
    """
    Junction table for content-media relationship
    """
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    media = models.ForeignKey(MediaLibrary, on_delete=models.CASCADE)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'content_media'
        unique_together = ('content', 'media')


class ChallengeType(models.TextChoices):
    SCAVENGER_HUNT = 'scavenger_hunt', 'Scavenger Hunt'
    QUIZ = 'quiz', 'Quiz'
    PHOTO_CHALLENGE = 'photo_challenge', 'Photo Challenge'
    AR_EXPERIENCE = 'ar_experience', 'AR Experience'


class Challenge(BaseEntity):
    """
    Challenge model for gamification
    """
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=ChallengeType.choices)
    points = models.IntegerField(default=0)
    # Note: We'll handle the circular reference between Challenge and Marker differently
    # marker = models.ForeignKey('Marker', on_delete=models.SET_NULL, null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)

    class Meta:
        db_table = 'challenge'


class Marker(BaseEntity):
    """
    AR marker model
    """
    code = models.CharField(max_length=100, unique=True)
    # Simplified location representation without GIS
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    content_url = models.TextField()
    challenge = models.ForeignKey(Challenge, on_delete=models.SET_NULL, null=True, blank=True, related_name='markers')

    class Meta:
        db_table = 'marker'


# Add the foreign key from Challenge to Marker after both models are defined
# This resolves the circular reference
Challenge.add_to_class('marker', models.ForeignKey(Marker, on_delete=models.SET_NULL, null=True, blank=True, related_name='challenges'))


class ChallengeProgress(BaseEntity):
    """
    Track user progress on challenges
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'challenge_progress'
        unique_together = ('user', 'challenge')


class Feedback(BaseEntity):
    """
    User feedback model
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.SmallIntegerField()
    comment = models.TextField(blank=True, null=True, validators=[MaxLengthValidator(1000)])

    class Meta:
        db_table = 'feedback'


class ChatSession(BaseEntity):
    """
    Chat session model
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    message_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'chat_session'


# Wagtail models for media content management
class HomePage(Page):
    """
    Custom homepage that manages media content instead of webpages
    """
    intro = models.CharField(
        max_length=255,
        blank=True,
        help_text="Introductory text for the homepage"
    )
    
    body = RichTextField(
        blank=True,
        help_text="Main content for the homepage"
    )
    
    content_panels = Page.content_panels + [
        FieldPanel('intro'),
        FieldPanel('body'),
    ]
    
    # Explicitly set the page to be a singleton
    max_count = 1

    def get_context(self, request):
        context = super().get_context(request)
        # Get all media content for display
        from .models import MediaLibrary
        context['media_library'] = MediaLibrary.objects.all().order_by('-created_at')
        return context


class MediaPage(Page):
    """
    A page for displaying and managing media content
    """
    description = RichTextField(
        blank=True,
        help_text="Description of the media content"
    )
    
    media_type = models.CharField(
        max_length=20,
        choices=ContentTypeEnum.choices,
        help_text="Type of media content"
    )
    
    # Fields for different media types
    video_file = models.FileField(
        upload_to='videos/',
        blank=True,
        null=True,
        help_text="Upload video file if media type is video"
    )
    
    audio_file = models.FileField(
        upload_to='audio/',
        blank=True,
        null=True,
        help_text="Upload audio file if media type is music"
    )
    
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text="Select an image if media type is image"
    )
    
    document = models.ForeignKey(
        'wagtaildocs.Document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text="Select a document if applicable"
    )
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Author of the media content"
    )
    
    category = models.ForeignKey(
        ContentCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Category for the media content"
    )
    
    content_panels = Page.content_panels + [
        FieldPanel('description'),
        FieldPanel('media_type'),
        FieldPanel('video_file'),
        FieldPanel('audio_file'),
        FieldPanel('image'),
        FieldPanel('document'),
        FieldPanel('author'),
        FieldPanel('category'),
    ]
    
    def __str__(self):
        return f"Media: {self.title}"