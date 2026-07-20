from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from apps.common.permissions import IsAdminOrBureau
from .models import Article, ArticleCategory
from .serializers import (
    ArticleListSerializer, ArticleDetailSerializer, ArticleAdminSerializer, ArticleCategorySerializer,
)


class ArticleListView(generics.ListAPIView):
    serializer_class = ArticleListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return (
            Article.objects
            .filter(status=Article.STATUS_PUBLISHED)
            .select_related("author", "category")
            .order_by("-published_at")
        )


class ArticleDetailView(generics.RetrieveAPIView):
    serializer_class = ArticleDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Article.objects
            .filter(status=Article.STATUS_PUBLISHED)
            .select_related("author", "category")
        )


class ArticleCategoryListView(generics.ListAPIView):
    queryset = ArticleCategory.objects.order_by("name")
    serializer_class = ArticleCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrBureau]
    pagination_class = None


class ArticleAdminViewSet(ModelViewSet):
    queryset = Article.objects.select_related("author", "category").order_by("-created_at")
    serializer_class = ArticleAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminOrBureau]

    def perform_create(self, serializer):
        self._save_with_published_at(serializer, author=self.request.user)

    def perform_update(self, serializer):
        self._save_with_published_at(serializer)

    def _save_with_published_at(self, serializer, **extra):
        published_at = serializer.validated_data.get("published_at")
        status = serializer.validated_data.get("status")
        if status == Article.STATUS_PUBLISHED and not published_at:
            extra["published_at"] = timezone.now()
        serializer.save(**extra)
