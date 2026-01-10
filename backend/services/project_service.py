"""
Project service - business logic for project operations.
"""
from typing import Optional
from uuid import UUID
from django.core.exceptions import ValidationError, PermissionDenied

from organizations.models import Organization
from projects.models import Project
from core.constants import ProjectStatus


class ProjectService:
    """Service layer for project operations."""

    @staticmethod
    def get_projects_for_organization(organization_id: UUID) -> list[Project]:
        """Get all projects for an organization."""
        return list(Project.objects.filter(organization_id=organization_id))

    @staticmethod
    def get_project(project_id: UUID, organization_id: UUID) -> Project:
        """
        Get a single project, ensuring it belongs to the organization.
        Raises PermissionDenied if project doesn't belong to organization.
        """
        try:
            project = Project.objects.select_related('organization').get(id=project_id)
        except Project.DoesNotExist:
            raise ValidationError("Project not found")
        
        if project.organization_id != organization_id:
            raise PermissionDenied("Access denied to this project")
        
        return project

    @staticmethod
    def create_project(
        organization_id: UUID,
        name: str,
        description: str = '',
        status: str = ProjectStatus.PLANNING,
        due_date: Optional[str] = None
    ) -> Project:
        """Create a new project."""
        if not name or not name.strip():
            raise ValidationError("Project name is required")

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            raise ValidationError("Organization not found")

        project = Project.objects.create(
            organization=organization,
            name=name.strip(),
            description=description,
            status=status,
            due_date=due_date
        )
        return project

    @staticmethod
    def update_project(
        project_id: UUID,
        organization_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
        due_date: Optional[str] = None
    ) -> Project:
        """Update an existing project."""
        project = ProjectService.get_project(project_id, organization_id)

        if name is not None:
            if not name.strip():
                raise ValidationError("Project name cannot be empty")
            project.name = name.strip()

        if description is not None:
            project.description = description

        if status is not None:
            if status not in ProjectStatus.values:
                raise ValidationError(f"Invalid status: {status}")
            project.status = status

        if due_date is not None:
            project.due_date = due_date if due_date else None

        project.save()
        return project

    @staticmethod
    def get_project_statistics(project_id: UUID, organization_id: UUID) -> dict:
        """Get statistics for a project."""
        project = ProjectService.get_project(project_id, organization_id)
        return {
            'total_tasks': project.total_tasks,
            'completed_tasks': project.completed_tasks,
            'completion_percentage': project.completion_percentage,
            'pending_tasks': project.total_tasks - project.completed_tasks,
        }
