"""
GraphQL queries for the project management system.
"""
import graphene
from uuid import UUID

from .types import ProjectType, TaskType, ProjectStatisticsType, OrganizationType, UserType
from services.project_service import ProjectService
from services.task_service import TaskService
from organizations.models import Organization


class Query(graphene.ObjectType):
    """Root query type."""
    
    # Auth
    me = graphene.Field(UserType)

    # Organization queries
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(
        OrganizationType,
        id=graphene.UUID(required=True)
    )

    # Project queries
    projects = graphene.List(
        ProjectType,
        organization_id=graphene.UUID(required=True)
    )
    project = graphene.Field(
        ProjectType,
        id=graphene.UUID(required=True),
        organization_id=graphene.UUID(required=True)
    )
    project_statistics = graphene.Field(
        ProjectStatisticsType,
        project_id=graphene.UUID(required=True),
        organization_id=graphene.UUID(required=True)
    )

    # Task queries
    tasks = graphene.List(
        TaskType,
        project_id=graphene.UUID(required=True),
        organization_id=graphene.UUID(required=True)
    )
    task = graphene.Field(
        TaskType,
        id=graphene.UUID(required=True),
        organization_id=graphene.UUID(required=True)
    )

    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated:
            return user
        return None

    def resolve_organizations(self, info):
        if not info.context.user.is_authenticated:
            return []
        return Organization.objects.filter(is_active=True)

    def resolve_organization(self, info, id):
        if not info.context.user.is_authenticated:
            return None
        try:
            return Organization.objects.get(id=id, is_active=True)
        except Organization.DoesNotExist:
            return None

    def resolve_projects(self, info, organization_id):
        if not info.context.user.is_authenticated:
            return []
        return ProjectService.get_projects_for_organization(organization_id)

    def resolve_project(self, info, id, organization_id):
        if not info.context.user.is_authenticated:
            return None
        try:
            return ProjectService.get_project(id, organization_id)
        except Exception:
            return None

    def resolve_project_statistics(self, info, project_id, organization_id):
        if not info.context.user.is_authenticated:
            return None
        try:
            stats = ProjectService.get_project_statistics(project_id, organization_id)
            return ProjectStatisticsType(**stats)
        except Exception:
            return None

    def resolve_tasks(self, info, project_id, organization_id):
        if not info.context.user.is_authenticated:
            return []
        return TaskService.get_tasks_for_project(project_id, organization_id)

    def resolve_task(self, info, id, organization_id):
        if not info.context.user.is_authenticated:
            return None
        try:
            return TaskService.get_task(id, organization_id)
        except Exception:
            return None
