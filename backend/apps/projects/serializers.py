from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Project

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    """Lecture — ouverte à tout membre connecté."""
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    owner_id = serializers.IntegerField(read_only=True)
    owner_name = serializers.CharField(source="owner.full_name", read_only=True, default=None)
    member_names = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)

    class Meta:
        model = Project
        fields = [
            "id", "title", "description", "status", "status_display",
            "owner_id", "owner_name", "member_names", "department_name", "deadline",
            "repository_url", "created_at",
        ]

    def get_member_names(self, obj):
        return [m.full_name for m in obj.members.all()]


class ProjectWriteSerializer(serializers.ModelSerializer):
    """Création/édition — le propriétaire est fixé par la vue (request.user à la
    création), jamais transmis par le client."""
    members = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)

    class Meta:
        model = Project
        fields = ["title", "description", "status", "department", "deadline", "repository_url", "members"]
