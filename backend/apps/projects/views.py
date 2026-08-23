from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from apps.common.permissions import IsOwnerOrAdmin
from .models import Project
from .serializers import ProjectSerializer, ProjectWriteSerializer


class ProjectViewSet(ModelViewSet):
    """Projets communautaires — lecture ouverte à tout membre connecté ; création
    libre (le créateur devient propriétaire) ; édition/suppression réservées au
    propriétaire, à l'admin ou au bureau."""
    queryset = Project.objects.select_related("owner", "department").prefetch_related("members")

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProjectWriteSerializer
        return ProjectSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
