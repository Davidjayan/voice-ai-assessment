"""
Project model.
"""
from django.db import models
from core.models import TimestampedModel
from core.constants import ProjectStatus
from organizations.models import Organization


class Project(TimestampedModel):
    """
    Project model - belongs to an organization.
    Contains tasks related to the project.
    """
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects',
        db_index=True
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.PLANNING,
        db_index=True
    )
    due_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
        ]

    def __str__(self):
        return self.name

    @property
    def total_tasks(self):
        """Get total number of tasks in this project."""
        return self.tasks.count()

    @property
    def completed_tasks(self):
        """Get number of completed tasks."""
        return self.tasks.filter(status='DONE').count()

    @property
    def completion_percentage(self):
        """Calculate completion percentage."""
        total = self.total_tasks
        if total == 0:
            return 0
        return round((self.completed_tasks / total) * 100, 1)
