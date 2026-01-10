"""
Organization model for multi-tenancy.
"""
from django.db import models
from core.models import TimestampedModel


class Organization(TimestampedModel):
    """
    Organization model - the root of multi-tenancy.
    All projects belong to an organization.
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    contact_email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class OrganizationMembership(TimestampedModel):
    """
    Membership model linking users to organizations with roles.
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]

    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='organization_memberships'
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

    class Meta:
        unique_together = ['user', 'organization']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.organization.name} ({self.role})"


import uuid
from django.utils import timezone
from datetime import timedelta

class OrganizationInvite(TimestampedModel):
    """
    Invite model for inviting users to organizations.
    """
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='invites'
    )
    email = models.EmailField()
    invite_code = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    invited_by = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='sent_invites'
    )
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_invites'
    )

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return not self.used and self.expires_at > timezone.now()

    def __str__(self):
        return f"Invite to {self.organization.name} for {self.email}"
