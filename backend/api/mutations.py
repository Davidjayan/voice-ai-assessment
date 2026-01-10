"""
GraphQL mutations for the project management system.
"""
import graphene
from django.core.exceptions import ValidationError, PermissionDenied
from django.contrib.auth.models import User

from .types import ProjectType, TaskType, TaskCommentType, ProjectInput, TaskInput, CommentInput
from services.project_service import ProjectService
from services.task_service import TaskService


class CreateProject(graphene.Mutation):
    """Create a new project."""
    
    class Arguments:
        organization_id = graphene.UUID(required=True)
        input = ProjectInput(required=True)

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, organization_id, input):
        if not info.context.user.is_authenticated:
            return CreateProject(project=None, success=False, error="Authentication required")
        try:
            project = ProjectService.create_project(
                organization_id=organization_id,
                name=input.name,
                description=input.description or '',
                status=input.status or 'PLANNING',
                due_date=input.due_date
            )
            return CreateProject(project=project, success=True, error=None)
        except (ValidationError, PermissionDenied) as e:
            return CreateProject(project=None, success=False, error=str(e))


class UpdateProject(graphene.Mutation):
    """Update an existing project."""
    
    class Arguments:
        id = graphene.UUID(required=True)
        organization_id = graphene.UUID(required=True)
        input = ProjectInput(required=True)

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, id, organization_id, input):
        if not info.context.user.is_authenticated:
            return UpdateProject(project=None, success=False, error="Authentication required")
        try:
            project = ProjectService.update_project(
                project_id=id,
                organization_id=organization_id,
                name=input.name,
                description=input.description,
                status=input.status,
                due_date=input.due_date
            )
            return UpdateProject(project=project, success=True, error=None)
        except (ValidationError, PermissionDenied) as e:
            return UpdateProject(project=None, success=False, error=str(e))


class CreateTask(graphene.Mutation):
    """Create a new task."""
    
    class Arguments:
        project_id = graphene.UUID(required=True)
        organization_id = graphene.UUID(required=True)
        input = TaskInput(required=True)

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, project_id, organization_id, input):
        if not info.context.user.is_authenticated:
            return CreateTask(task=None, success=False, error="Authentication required")
        try:
            task = TaskService.create_task(
                project_id=project_id,
                organization_id=organization_id,
                title=input.title,
                description=input.description or '',
                status=input.status or 'TODO',
                priority=input.priority or 'MEDIUM',
                assignee_email=input.assignee_email or '',
                due_date=input.due_date
            )
            return CreateTask(task=task, success=True, error=None)
        except (ValidationError, PermissionDenied) as e:
            return CreateTask(task=None, success=False, error=str(e))


class UpdateTask(graphene.Mutation):
    """Update an existing task."""
    
    class Arguments:
        id = graphene.UUID(required=True)
        organization_id = graphene.UUID(required=True)
        input = TaskInput(required=True)

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, id, organization_id, input):
        if not info.context.user.is_authenticated:
            return UpdateTask(task=None, success=False, error="Authentication required")
        try:
            task = TaskService.update_task(
                task_id=id,
                organization_id=organization_id,
                title=input.title,
                description=input.description,
                status=input.status,
                priority=input.priority,
                assignee_email=input.assignee_email,
                due_date=input.due_date
            )
            return UpdateTask(task=task, success=True, error=None)
        except (ValidationError, PermissionDenied) as e:
            return UpdateTask(task=None, success=False, error=str(e))


class AddTaskComment(graphene.Mutation):
    """Add a comment to a task."""
    
    class Arguments:
        task_id = graphene.UUID(required=True)
        organization_id = graphene.UUID(required=True)
        input = CommentInput(required=True)

    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, task_id, organization_id, input):
        if not info.context.user.is_authenticated:
            return AddTaskComment(comment=None, success=False, error="Authentication required")
        try:
            comment = TaskService.add_comment(
                task_id=task_id,
                organization_id=organization_id,
                content=input.content,
                author_name=input.author_name or 'Anonymous',
                author_email=input.author_email or ''
            )
            return AddTaskComment(comment=comment, success=True, error=None)
        except (ValidationError, PermissionDenied) as e:
            return AddTaskComment(comment=None, success=False, error=str(e))


from django.contrib.auth import authenticate, login, logout
from .types import UserType

# Auth Mutations
class Register(graphene.Mutation):
    """Register a new user."""
    
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, username, email, password):
        try:
            if User.objects.filter(username=username).exists():
                return Register(user=None, success=False, error="Username already exists")
            if User.objects.filter(email=email).exists():
                return Register(user=None, success=False, error="Email already exists")
                
            # Use explicit create + set_password for robustness/clarity
            user = User(username=username, email=email, is_active=True)
            user.set_password(password)
            user.save()
            return Register(user=user, success=True, error=None)
        except Exception as e:
            return Register(user=None, success=False, error=str(e))


class Login(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    session_key = graphene.String()
    user = graphene.Field(UserType)
    error = graphene.String()

    def mutate(self, info, username, password):
        user = authenticate(username=username, password=password)
        if user is not None:
            login(info.context, user)
            if not info.context.session.session_key:
                info.context.session.save()
            return Login(success=True, session_key=info.context.session.session_key, user=user)
        else:
            # Debugging Helpers
            if not User.objects.filter(username=username).exists():
                return Login(success=False, error="User not found")
            
            u = User.objects.get(username=username)
            if not u.check_password(password):
                return Login(success=False, error="Invalid password")
                
            if not u.is_active:
                return Login(success=False, error="User account is disabled")
                
            return Login(success=False, error="Invalid credentials (unknown reason)")


class Logout(graphene.Mutation):
    success = graphene.Boolean()

    def mutate(self, info):
        logout(info.context)
        return Logout(success=True)


class Mutation(graphene.ObjectType):
    """Root mutation type."""
    # Auth
    login = Login.Field()
    logout = Logout.Field()
    register = Register.Field()

    # Projects
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    add_task_comment = AddTaskComment.Field()
