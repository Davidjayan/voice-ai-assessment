from django.test import TestCase
from django.contrib.auth.models import User
from organizations.models import Organization
from projects.models import Project
from tasks.models import Task, TaskComment
from core.constants import ProjectStatus, TaskStatus, TaskPriority
from graphene.test import Client
from api.schema import schema
import json

class ModelTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org", slug="test-org")
        self.project = Project.objects.create(
            organization=self.org,
            name="Test Project",
            status=ProjectStatus.PLANNING
        )

    def test_organization_creation(self):
        self.assertEqual(self.org.name, "Test Org")
        self.assertEqual(self.org.slug, "test-org")

    def test_project_creation(self):
        self.assertEqual(self.project.name, "Test Project")
        self.assertEqual(self.project.organization, self.org)

    def test_task_creation(self):
        task = Task.objects.create(
            project=self.project,
            title="Test Task",
            status=TaskStatus.TODO,
            priority=TaskPriority.HIGH
        )
        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.project, self.project)

class GraphQLTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client = Client(schema)
        self.org = Organization.objects.create(name="Test Org", slug="test-org")

    def test_me_query(self):
        # We can't easily test authentication with the graphene client without a lot of setup
        # But we can verify the query exists in the schema
        query = '''
            query {
                me {
                    username
                }
            }
        '''
        executed = self.client.execute(query)
        # It should return null because we are not authenticated in this test client context
        self.assertIsNone(executed['data']['me'])
