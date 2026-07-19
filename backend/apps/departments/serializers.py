from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from .models import (
    Department, DepartmentMembership, DepartmentAnnouncement, DepartmentSession, DepartmentTask,
)

User = get_user_model()


class DepartmentMembershipSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = DepartmentMembership
        fields = [
            "id", "user_id", "user_full_name", "user_email",
            "start_date", "end_date", "is_current",
        ]

    def get_is_current(self, obj) -> bool:
        today = timezone.now().date()
        return obj.end_date is None or obj.end_date >= today


class AddMembershipSerializer(serializers.Serializer):
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source="user")
    start_date = serializers.DateField(default=timezone.now().date)
    end_date = serializers.DateField(required=False, allow_null=True)


class EndMembershipSerializer(serializers.Serializer):
    end_date = serializers.DateField(required=False, allow_null=True)


class DepartmentListSerializer(serializers.ModelSerializer):
    lead_id = serializers.SerializerMethodField()
    lead_name = serializers.SerializerMethodField()
    co_lead_id = serializers.SerializerMethodField()
    co_lead_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    can_manage = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            "id", "name", "description",
            "lead_id", "lead_name", "co_lead_id", "co_lead_name",
            "member_count", "can_manage", "created_at",
        ]

    def get_lead_id(self, obj) -> int | None:
        return obj.lead_id

    def get_lead_name(self, obj) -> str | None:
        return obj.lead.full_name if obj.lead else None

    def get_co_lead_id(self, obj) -> int | None:
        return obj.co_lead_id

    def get_co_lead_name(self, obj) -> str | None:
        return obj.co_lead.full_name if obj.co_lead else None

    def get_member_count(self, obj) -> int:
        today = timezone.now().date()
        from django.db.models import Q
        return obj.memberships.filter(Q(end_date__isnull=True) | Q(end_date__gte=today)).count()

    def get_can_manage(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        from .services import can_manage_department
        return can_manage_department(request.user, obj)


class DepartmentDetailSerializer(DepartmentListSerializer):
    memberships = DepartmentMembershipSerializer(many=True, read_only=True)

    class Meta(DepartmentListSerializer.Meta):
        fields = DepartmentListSerializer.Meta.fields + ["memberships"]


class DepartmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["name", "description", "lead", "co_lead"]


class DepartmentAnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True, default=None)

    class Meta:
        model = DepartmentAnnouncement
        fields = ["id", "title", "content", "author_name", "created_at"]


class AnnouncementWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=300)
    content = serializers.CharField()


class DepartmentSessionSerializer(serializers.ModelSerializer):
    present_member_ids = serializers.PrimaryKeyRelatedField(
        source="present_members", many=True, read_only=True,
    )
    present_count = serializers.IntegerField(source="present_members.count", read_only=True)

    class Meta:
        model = DepartmentSession
        fields = [
            "id", "date", "theme", "report", "present_member_ids", "present_count", "created_at",
        ]


class SessionWriteSerializer(serializers.Serializer):
    date = serializers.DateField()
    theme = serializers.CharField(max_length=300, required=False, allow_blank=True)


class SessionReportSerializer(serializers.Serializer):
    report = serializers.CharField(allow_blank=True)
    present_user_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False, default=list,
    )


class DepartmentTaskSerializer(serializers.ModelSerializer):
    assigned_to_id = serializers.IntegerField(source="assigned_to.id", read_only=True, default=None)
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True, default=None)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = DepartmentTask
        fields = [
            "id", "title", "description", "assigned_to_id", "assigned_to_name",
            "due_date", "status", "status_display", "created_at",
        ]


class TaskWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=300)
    description = serializers.CharField(required=False, allow_blank=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="assigned_to", required=False, allow_null=True,
    )
    due_date = serializers.DateField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=DepartmentTask.STATUS_CHOICES, required=False)


class TaskStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=DepartmentTask.STATUS_CHOICES)
