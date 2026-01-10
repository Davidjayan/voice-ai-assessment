"""
Task service - business logic for task operations.
"""
from typing import Optional
from uuid import UUID
from django.core.exceptions import ValidationError, PermissionDenied

from tasks.models import Task, TaskComment
from projects.models import Project
from core.constants import TaskStatus, TaskPriority


class TaskService:
    """Service layer for task operations."""

    @staticmethod
    def _verify_project_access(project_id: UUID, organization_id: UUID) -> Project:
        """Verify project belongs to organization and return it."""
        try:
            project = Project.objects.select_related('organization').get(id=project_id)
        except Project.DoesNotExist:
            raise ValidationError("Project not found")
        
        if project.organization_id != organization_id:
            raise PermissionDenied("Access denied to this project")
        
        return project

    @staticmethod
    def _verify_task_access(task_id: UUID, organization_id: UUID) -> Task:
        """Verify task belongs to organization and return it."""
        try:
            task = Task.objects.select_related('project__organization').get(id=task_id)
        except Task.DoesNotExist:
            raise ValidationError("Task not found")
        
        if task.project.organization_id != organization_id:
            raise PermissionDenied("Access denied to this task")
        
        return task

    @staticmethod
    def get_tasks_for_project(project_id: UUID, organization_id: UUID) -> list[Task]:
        """Get all tasks for a project."""
        TaskService._verify_project_access(project_id, organization_id)
        return list(Task.objects.filter(project_id=project_id))

    @staticmethod
    def get_task(task_id: UUID, organization_id: UUID) -> Task:
        """Get a single task."""
        return TaskService._verify_task_access(task_id, organization_id)

    @staticmethod
    def create_task(
        project_id: UUID,
        organization_id: UUID,
        title: str,
        description: str = '',
        status: str = TaskStatus.TODO,
        priority: str = TaskPriority.MEDIUM,
        assignee_email: str = '',
        due_date: Optional[str] = None
    ) -> Task:
        """Create a new task."""
        if not title or not title.strip():
            raise ValidationError("Task title is required")

        project = TaskService._verify_project_access(project_id, organization_id)

        # Get the next order value
        max_order = Task.objects.filter(project=project).count()

        task = Task.objects.create(
            project=project,
            title=title.strip(),
            description=description,
            status=status,
            priority=priority,
            assignee_email=assignee_email,
            due_date=due_date,
            order=max_order
        )
        return task

    @staticmethod
    def update_task(
        task_id: UUID,
        organization_id: UUID,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assignee_email: Optional[str] = None,
        due_date: Optional[str] = None
    ) -> Task:
        """Update an existing task."""
        task = TaskService._verify_task_access(task_id, organization_id)

        if title is not None:
            if not title.strip():
                raise ValidationError("Task title cannot be empty")
            task.title = title.strip()

        if description is not None:
            task.description = description

        if status is not None:
            if status not in TaskStatus.values:
                raise ValidationError(f"Invalid status: {status}")
            task.status = status

        if priority is not None:
            if priority not in TaskPriority.values:
                raise ValidationError(f"Invalid priority: {priority}")
            task.priority = priority

        if assignee_email is not None:
            task.assignee_email = assignee_email

        if due_date is not None:
            task.due_date = due_date if due_date else None

        task.save()
        return task

    @staticmethod
    def add_comment(
        task_id: UUID,
        organization_id: UUID,
        content: str,
        author_name: str = 'Anonymous',
        author_email: str = ''
    ) -> TaskComment:
        """Add a comment to a task."""
        if not content or not content.strip():
            raise ValidationError("Comment content is required")

        task = TaskService._verify_task_access(task_id, organization_id)

        comment = TaskComment.objects.create(
            task=task,
            content=content.strip(),
            author_name=author_name.strip() or 'Anonymous',
            author_email=author_email
        )
        return comment

    @staticmethod
    def get_comments_for_task(task_id: UUID, organization_id: UUID) -> list[TaskComment]:
        """Get all comments for a task."""
        TaskService._verify_task_access(task_id, organization_id)
        return list(TaskComment.objects.filter(task_id=task_id))
