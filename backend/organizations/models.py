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
