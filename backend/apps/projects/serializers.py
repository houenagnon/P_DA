from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.common.permissions import is_bureau
from apps.departments.services import get_department_member_ids
from .models import Project, ProjectTask

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    """Lecture — ouverte à tout membre connecté."""
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    owner_id = serializers.IntegerField(read_only=True)
    owner_name = serializers.CharField(source="owner.full_name", read_only=True, default=None)
    member_names = serializers.SerializerMethodField()
    department_id = serializers.IntegerField(read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)

    class Meta:
        model = Project
        fields = [
            "id", "title", "description", "status", "status_display",
            "owner_id", "owner_name", "member_names", "department_id", "department_name",
            "deadline", "repository_url", "created_at",
        ]

    def get_member_names(self, obj):
        return [m.full_name for m in obj.members.all()]


class ProjectWriteSerializer(serializers.ModelSerializer):
    """Création/édition — le propriétaire est fixé par la vue (request.user à la
    création), jamais transmis par le client. Un projet rattaché à un département
    ne peut être créé/déplacé que par le responsable/adjoint de ce département,
    ou le bureau/admin ; sans département, seul le bureau/admin peut créer."""
    members = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)

    class Meta:
        model = Project
        fields = ["title", "description", "status", "department", "deadline", "repository_url", "members"]

    def validate(self, attrs):
        is_create = self.instance is None
        if not is_create and "department" not in attrs:
            return attrs  # champ non touché en édition partielle — déjà validé quand il l'a été

        department = attrs.get("department")
        user = self.context["request"].user

        if department is None:
            if not is_bureau(user):
                raise serializers.ValidationError({
                    "department": "Seuls le bureau ou l'admin peuvent créer un projet sans département.",
                })
        elif not (is_bureau(user) or user.id in (department.lead_id, department.co_lead_id)):
            raise serializers.ValidationError({
                "department": "Vous devez être responsable ou adjoint de ce département pour y créer un projet.",
            })

        return attrs


class ProjectTaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True, default=None)
    project_title = serializers.CharField(source="project.title", read_only=True)

    class Meta:
        model = ProjectTask
        fields = [
            "id", "project", "project_title", "title", "description",
            "assigned_to", "assigned_to_name", "due_date", "is_done", "created_at",
        ]
        read_only_fields = ["id", "project", "project_title", "created_at"]


class ProjectTaskWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTask
        fields = ["title", "description", "assigned_to", "due_date", "is_done"]

    def validate_assigned_to(self, value):
        if value is None:
            return value
        request = self.context["request"]
        project = self.context["project"]
        if is_bureau(request.user):
            return value
        if value.id not in get_department_member_ids(project.department):
            raise serializers.ValidationError(
                "Vous ne pouvez assigner une tâche qu'à un membre de votre département."
            )
        return value


class ProjectTaskStatusUpdateSerializer(serializers.Serializer):
    is_done = serializers.BooleanField()
