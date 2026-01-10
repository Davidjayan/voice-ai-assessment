"""
Constants and enums for the project management system.
"""
from django.db import models


class TaskStatus(models.TextChoices):
    """Status choices for tasks."""
    TODO = 'TODO', 'To Do'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    IN_REVIEW = 'IN_REVIEW', 'In Review'
    DONE = 'DONE', 'Done'


class ProjectStatus(models.TextChoices):
    """Status choices for projects."""
    PLANNING = 'PLANNING', 'Planning'
    ACTIVE = 'ACTIVE', 'Active'
    ON_HOLD = 'ON_HOLD', 'On Hold'
    COMPLETED = 'COMPLETED', 'Completed'
    ARCHIVED = 'ARCHIVED', 'Archived'


class TaskPriority(models.TextChoices):
    """Priority levels for tasks."""
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    URGENT = 'URGENT', 'Urgent'
