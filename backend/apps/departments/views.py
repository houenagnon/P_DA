from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.common.permissions import IsAdminOrBureau
from .models import Department, DepartmentMembership
from .serializers import (
    DepartmentListSerializer, DepartmentDetailSerializer, DepartmentWriteSerializer,
    DepartmentMembershipSerializer, AddMembershipSerializer, EndMembershipSerializer,
)
from .services import save_department, add_member, end_membership


class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.select_related("lead", "co_lead").prefetch_related("memberships")
    permission_classes = [IsAuthenticated, IsAdminOrBureau]

    def get_serializer_class(self):
        if self.action == "list":
            return DepartmentListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return DepartmentWriteSerializer
        return DepartmentDetailSerializer

    def perform_create(self, serializer):
        save_department(serializer)

    def perform_update(self, serializer):
        save_department(serializer)

    @action(detail=True, methods=["get", "post"], url_path="members")
    def members(self, request, pk=None):
        department = self.get_object()
        if request.method == "GET":
            queryset = department.memberships.select_related("user").order_by("-start_date")
            return Response(DepartmentMembershipSerializer(queryset, many=True).data)

        serializer = AddMembershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = add_member(
            department,
            serializer.validated_data["user"],
            serializer.validated_data["start_date"],
            serializer.validated_data.get("end_date"),
        )
        return Response(
            DepartmentMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="members/(?P<membership_id>[^/.]+)/end")
    def end_member(self, request, pk=None, membership_id=None):
        department = self.get_object()
        try:
            membership = department.memberships.get(pk=membership_id)
        except DepartmentMembership.DoesNotExist:
            return Response({"detail": "Adhésion introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EndMembershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        end_membership(membership, serializer.validated_data.get("end_date"))
        return Response(DepartmentMembershipSerializer(membership).data)

    @action(detail=True, methods=["delete"], url_path="members/(?P<membership_id>[^/.]+)")
    def remove_member(self, request, pk=None, membership_id=None):
        department = self.get_object()
        try:
            membership = department.memberships.get(pk=membership_id)
        except DepartmentMembership.DoesNotExist:
            return Response({"detail": "Adhésion introuvable."}, status=status.HTTP_404_NOT_FOUND)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
