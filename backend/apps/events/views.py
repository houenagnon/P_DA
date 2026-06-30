from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.permissions import IsAdminOrBureau
from .filters import EventFilter
from .models import Event, EventParticipant
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventWriteSerializer,
    EventParticipantSerializer, RegisterForEventSerializer,
)
from .services import register_participant, validate_presence, generate_qr_code, export_participants_excel


class EventViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = EventFilter
    search_fields = ["title", "description"]
    ordering_fields = ["start_date", "created_at"]

    def get_queryset(self):
        qs = Event.objects.prefetch_related("participants", "speakers")
        if not self.request.user.is_authenticated or not (
            self.request.user.is_admin or self.request.user.is_bureau
        ):
            return qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return EventListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return EventWriteSerializer
        return EventDetailSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrBureau()]
        return [AllowAny()]

    def perform_create(self, serializer):
        event = serializer.save(created_by=self.request.user)
        generate_qr_code(event)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        event = self.get_object()
        serializer = RegisterForEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        participant = register_participant(
            event, request.user,
            motivation=serializer.validated_data.get("motivation", ""),
        )
        return Response(
            EventParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"],
            url_path="validate/(?P<user_id>[^/.]+)",
            permission_classes=[IsAuthenticated, IsAdminOrBureau])
    def validate_presence(self, request, pk=None, user_id=None):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        event = self.get_object()
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)
        participant = validate_presence(event, user)
        return Response(EventParticipantSerializer(participant).data)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated, IsAdminOrBureau])
    def participants(self, request, pk=None):
        event = self.get_object()
        queryset = event.participants.select_related("user").order_by("created_at")
        serializer = EventParticipantSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated, IsAdminOrBureau])
    def export(self, request, pk=None):
        event = self.get_object()
        content = export_participants_excel(event)
        response = HttpResponse(
            content,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="participants_{event.pk}.xlsx"'
        return response
