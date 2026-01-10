"""
GraphQL types for the project management system.
"""
import graphene
from graphene_django import DjangoObjectType

from organizations.models import Organization
from projects.models import Project
from tasks.models import Task, TaskComment
from core.constants import TaskStatus, TaskPriority, ProjectStatus


from django.contrib.auth.models import User

# Enums
TaskStatusEnum = graphene.Enum.from_enum(TaskStatus)
TaskPriorityEnum = graphene.Enum.from_enum(TaskPriority)
ProjectStatusEnum = graphene.Enum.from_enum(ProjectStatus)


# Object Types
class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'contact_email', 'description', 'is_active', 'created_at', 'updated_at']


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'author_name', 'author_email', 'created_at', 'updated_at']


class TaskType(DjangoObjectType):
    status = graphene.Field(TaskStatusEnum)
    priority = graphene.Field(TaskPriorityEnum)
    comments = graphene.List(TaskCommentType)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'assignee_email', 'due_date', 
                  'order', 'created_at', 'updated_at', 'comments']

    def resolve_comments(self, info):
        return self.comments.all()


class ProjectStatisticsType(graphene.ObjectType):
    """Statistics for a project."""
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    pending_tasks = graphene.Int()
    completion_percentage = graphene.Float()


class ProjectType(DjangoObjectType):
    status = graphene.Field(ProjectStatusEnum)
    tasks = graphene.List(TaskType)
    statistics = graphene.Field(ProjectStatisticsType)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'due_date', 
                  'created_at', 'updated_at', 'tasks', 'statistics']

    def resolve_tasks(self, info):
        return self.tasks.all()

    def resolve_statistics(self, info):
        return ProjectStatisticsType(
            total_tasks=self.total_tasks,
            completed_tasks=self.completed_tasks,
            pending_tasks=self.total_tasks - self.completed_tasks,
            completion_percentage=self.completion_percentage
        )


# Input Types
class ProjectInput(graphene.InputObjectType):
    """Input type for creating/updating projects."""
    name = graphene.String()
    description = graphene.String()
    status = graphene.Argument(ProjectStatusEnum)
    due_date = graphene.Date()


class TaskInput(graphene.InputObjectType):
    """Input type for creating/updating tasks."""
    title = graphene.String()
    description = graphene.String()
    status = graphene.Argument(TaskStatusEnum)
    priority = graphene.Argument(TaskPriorityEnum)
    assignee_email = graphene.String()
    due_date = graphene.Date()


class CommentInput(graphene.InputObjectType):
    """Input type for adding comments."""
    content = graphene.String(required=True)
    author_name = graphene.String()
    author_email = graphene.String()
