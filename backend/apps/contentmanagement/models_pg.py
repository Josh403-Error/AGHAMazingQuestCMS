from django.db import models
from django.contrib.gis.db import models as gis_models
from wagtail.models import Page
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
import uuid
from django.db.models import Q


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
    excerpt = models.TextField()
    file_path = models.TextField()
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.DRAFT)
    content_type = models.CharField(max_length=20, choices=ContentTypeEnum.choices)
    published_at = models.DateTimeField(null=True, blank=True)
    author = models.ForeignKey('usermanagement.User', on_delete=models.RESTRICT)
    category = models.ForeignKey(ContentCategory, on_delete=models.SET_NULL, null=True, blank=True)
    analytics = models.OneToOneField(ContentAnalytics, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(excerpt__length__lte=500),
                name='content_excerpt_max_length'
            )
        ]


class ApprovalStatus(models.TextChoices):
    APPROVED = 'approved', 'Approved'
    PENDING = 'pending', 'Pending'
    REJECTED = 'rejected', 'Rejected'


class ContentApproval(BaseEntity):
    """
    Content approval tracking
    """
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    approver = models.ForeignKey('usermanagement.User', on_delete=models.RESTRICT)
    approved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING)
    comments = models.TextField(blank=True, null=True)


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
    uploader = models.ForeignKey('usermanagement.User', on_delete=models.RESTRICT)

    class Meta:
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
    author = models.ForeignKey('usermanagement.User', on_delete=models.RESTRICT)


class Marker(BaseEntity):
    """
    AR marker model
    """
    code = models.CharField(max_length=100, unique=True)
    # Simplified location representation without GIS
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    content_url = models.TextField()
    challenge = models.ForeignKey(Challenge, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(code__regex=r'^[A-Z0-9]{6,20}$'),
                name='marker_code_valid_format'
            )
        ]


# Add the foreign key from Challenge to Marker after both models are defined
# This resolves the circular reference
Challenge.add_to_class('marker', models.ForeignKey(Marker, on_delete=models.SET_NULL, null=True, blank=True))


class ChallengeProgress(BaseEntity):
    """
    Track user progress on challenges
    """
    user = models.ForeignKey('usermanagement.User', on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'challenge')


class Feedback(BaseEntity):
    """
    User feedback model
    """
    user = models.ForeignKey('usermanagement.User', on_delete=models.CASCADE)
    rating = models.SmallIntegerField()
    comment = models.TextField(blank=True, null=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(rating__gte=1) & Q(rating__lte=5),
                name='feedback_rating_range'
            ),
            models.CheckConstraint(
                condition=Q(comment__isnull=True) | Q(comment__length__lte=1000),
                name='feedback_comment_max_length'
            )
        ]


class ChatSession(BaseEntity):
    """
    Chat session model
    """
    user = models.ForeignKey('usermanagement.User', on_delete=models.CASCADE)
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    message_count = models.IntegerField(default=0)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(message_count__gte=0),
                name='chat_session_message_count_positive'
            )
        ]