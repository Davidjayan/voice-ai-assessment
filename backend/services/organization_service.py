from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from organizations.models import Organization, OrganizationMembership

class OrganizationService:
    @staticmethod
    def create_organization(name: str, user: User, description: str = "") -> Organization:
        """
        Create a new organization and add the creator as owner.
        """
        if not name:
            raise ValidationError("Organization name is required")

        # Generate slug from name
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        
        # Ensure unique slug
        while Organization.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        organization = Organization.objects.create(
            name=name,
            slug=slug,
            description=description,
            is_active=True
        )

        # Add creator as owner
        OrganizationMembership.objects.create(
            user=user,
            organization=organization,
            role='owner'
        )

        return organization
