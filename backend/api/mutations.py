"""
GraphQL mutations for the project management system.
"""
import graphene
from django.core.exceptions import ValidationError, PermissionDenied
from django.contrib.auth.models import User

from .types import ProjectType, TaskType, TaskCommentType, ProjectInput, TaskInput, CommentInput, OrganizationType
from services.project_service import ProjectService
from services.task_service import TaskService
from services.organization_service import OrganizationService
from organizations.models import OrganizationMembership, OrganizationInvite



class CreateOrganization(graphene.Mutation):
    """Create a new organization."""
    
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, name, description=""):
        if not info.context.user.is_authenticated:
            return CreateOrganization(organization=None, success=False, error="Authentication required")
        try:
            organization = OrganizationService.create_organization(
                name=name,
                user=info.context.user,
                description=description or ""
            )
            return CreateOrganization(organization=organization, success=True, error=None)
        except (ValidationError, PermissionDenied) as e:
            return CreateOrganization(organization=None, success=False, error=str(e))


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
        # Support login with email
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                return Login(success=False, error="User with this email not found")

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


class JoinOrganization(graphene.Mutation):
    """Join an organization using an invite code."""
    
    class Arguments:
        invite_code = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, invite_code):
        if not info.context.user.is_authenticated:
            return JoinOrganization(organization=None, success=False, error="Authentication required")
        
        try:
            invite = OrganizationInvite.objects.get(invite_code=invite_code)
        except OrganizationInvite.DoesNotExist:
            return JoinOrganization(organization=None, success=False, error="Invalid invite code")
        
        if not invite.is_valid:
            return JoinOrganization(organization=None, success=False, error="Invite has expired or already been used")
        
        # Check if already a member
        if OrganizationMembership.objects.filter(user=info.context.user, organization=invite.organization).exists():
            return JoinOrganization(organization=invite.organization, success=True, error=None)
        
        # Create membership
        OrganizationMembership.objects.create(
            user=info.context.user,
            organization=invite.organization,
            role='member'
        )
        
        # Mark invite as used
        invite.used = True
        invite.used_by = info.context.user
        invite.save()
        
        return JoinOrganization(organization=invite.organization, success=True, error=None)


class InviteToOrganization(graphene.Mutation):
    """Invite a user to an organization. Only owners can invite."""
    
    class Arguments:
        organization_id = graphene.UUID(required=True)
        email = graphene.String(required=True)

    invite_code = graphene.String()
    success = graphene.Boolean()
    error = graphene.String()

    def mutate(self, info, organization_id, email):
        if not info.context.user.is_authenticated:
            return InviteToOrganization(invite_code=None, success=False, error="Authentication required")
        
        # Check if user is owner of the organization
        try:
            membership = OrganizationMembership.objects.get(
                user=info.context.user,
                organization_id=organization_id
            )
        except OrganizationMembership.DoesNotExist:
            return InviteToOrganization(invite_code=None, success=False, error="Organization not found")
        
        if membership.role != 'owner':
            return InviteToOrganization(invite_code=None, success=False, error="Only organization owners can invite users")
        
        # Create invite
        from django.utils import timezone
        from datetime import timedelta
        from services.email_service import EmailService
        
        invite = OrganizationInvite.objects.create(
            organization_id=organization_id,
            email=email,
            invited_by=info.context.user,
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        # Send invite email (don't fail the mutation if email fails)
        EmailService.send_organization_invite(
            to_email=email,
            organization_name=membership.organization.name,
            invite_code=str(invite.invite_code),
            invited_by_username=info.context.user.username
        )
        
        return InviteToOrganization(invite_code=str(invite.invite_code), success=True, error=None)

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
    create_organization = CreateOrganization.Field()
    join_organization = JoinOrganization.Field()
    invite_to_organization = InviteToOrganization.Field()
    add_task_comment = AddTaskComment.Field()
