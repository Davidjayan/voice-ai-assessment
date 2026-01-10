"""
Task and TaskComment models.
"""
from django.db import models
from core.models import TimestampedModel
from core.constants import TaskStatus, TaskPriority
from projects.models import Project


class Task(TimestampedModel):
    """
    Task model - belongs to a project.
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks',
        db_index=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.TODO,
        db_index=True
    )
    priority = models.CharField(
        max_length=20,
        choices=TaskPriority.choices,
        default=TaskPriority.MEDIUM,
        db_index=True
    )
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['project', 'priority']),
        ]

    def __str__(self):
        return self.title

    @property
    def organization(self):
        """Get the organization this task belongs to via project."""
        return self.project.organization


class TaskComment(TimestampedModel):
    """
    Comment on a task.
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments',
        db_index=True
    )
    content = models.TextField()
    author_name = models.CharField(max_length=100, default='Anonymous')
    author_email = models.EmailField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment on {self.task.title}"
