from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Article
from .serializers import ArticleListSerializer, ArticleDetailSerializer


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
