from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from .models import Department, DepartmentMembership

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

    class Meta:
        model = Department
        fields = [
            "id", "name", "description",
            "lead_id", "lead_name", "co_lead_id", "co_lead_name",
            "member_count", "created_at",
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


class DepartmentDetailSerializer(DepartmentListSerializer):
    memberships = DepartmentMembershipSerializer(many=True, read_only=True)

    class Meta(DepartmentListSerializer.Meta):
        fields = DepartmentListSerializer.Meta.fields + ["memberships"]


class DepartmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["name", "description", "lead", "co_lead"]
