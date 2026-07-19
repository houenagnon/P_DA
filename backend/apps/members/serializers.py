from rest_framework import serializers
from .models import MemberProfile, MemberExperience, MemberCertification, SocialLink


class MemberExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberExperience
        fields = ["id", "title", "company", "start_date", "end_date", "is_current", "description"]


class MemberCertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberCertification
        fields = ["id", "title", "issuer", "issued_date", "credential_url"]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ["id", "platform", "url"]


class MemberProfileSerializer(serializers.ModelSerializer):
    experiences = MemberExperienceSerializer(many=True, read_only=True)
    certifications = MemberCertificationSerializer(many=True, read_only=True)
    social_links = SocialLinkSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_first_name = serializers.CharField(source="user.first_name", read_only=True)
    user_last_name = serializers.CharField(source="user.last_name", read_only=True)
    user_avatar = serializers.ImageField(source="user.avatar", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = MemberProfile
        fields = [
            "id", "slug", "bio", "skills",
            "github_url", "linkedin_url", "website_url", "cv",
            "is_public", "member_number", "created_at", "updated_at",
            "user_email", "user_first_name", "user_last_name", "user_avatar", "user_role",
            "experiences", "certifications", "social_links",
        ]
        read_only_fields = ["id", "slug", "member_number", "created_at", "updated_at"]


class PublicMemberProfileSerializer(serializers.ModelSerializer):
    experiences = MemberExperienceSerializer(many=True, read_only=True)
    certifications = MemberCertificationSerializer(many=True, read_only=True)
    social_links = SocialLinkSerializer(many=True, read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    avatar = serializers.ImageField(source="user.avatar", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    department = serializers.SerializerMethodField()

    class Meta:
        model = MemberProfile
        fields = [
            "slug", "bio", "skills",
            "github_url", "linkedin_url", "website_url",
            "first_name", "last_name", "avatar", "role", "department",
            "experiences", "certifications", "social_links",
        ]

    def get_department(self, obj):
        from django.db.models import Q
        from django.utils import timezone
        from apps.departments.models import DepartmentMembership

        today = timezone.now().date()
        membership = (
            DepartmentMembership.objects
            .filter(user=obj.user)
            .filter(Q(end_date__isnull=True) | Q(end_date__gte=today))
            .select_related("department")
            .order_by("-start_date")
            .first()
        )
        if not membership:
            return None
        return {
            "name": membership.department.name,
            "start_date": membership.start_date,
            "end_date": membership.end_date,
        }


class MemberListSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    avatar = serializers.ImageField(source="user.avatar", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = MemberProfile
        fields = [
            "id", "user_id", "slug", "first_name", "last_name", "email",
            "avatar", "role", "is_active", "skills", "member_number",
        ]


class PublicMemberListSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    avatar = serializers.ImageField(source="user.avatar", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    current_job = serializers.SerializerMethodField()

    class Meta:
        model = MemberProfile
        fields = ["slug", "first_name", "last_name", "avatar", "role", "skills", "current_job"]

    def get_current_job(self, obj):
        exp = obj.experiences.filter(is_current=True).first()
        if exp:
            return {"title": exp.title, "company": exp.company}
        return None
