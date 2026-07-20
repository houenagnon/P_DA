from rest_framework import serializers
from .models import Article, ArticleCategory


class ArticleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleCategory
        fields = ["id", "name", "slug"]


class ArticleListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    category = ArticleCategorySerializer(read_only=True)
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id", "slug", "title", "excerpt", "cover_image",
            "author_name", "category", "tags_list", "published_at",
        ]

    def get_author_name(self, obj):
        return obj.author.full_name if obj.author else None

    def get_tags_list(self, obj):
        return [t.strip() for t in obj.tags.split(",") if t.strip()] if obj.tags else []


class ArticleDetailSerializer(ArticleListSerializer):
    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ["content", "seo_title", "seo_description"]


class ArticleAdminSerializer(serializers.ModelSerializer):
    """Lecture + écriture pour la gestion admin — expose le statut et category_id
    en écriture, contrairement aux serializers publics (lecture seule, publiés)."""
    author_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Article
        fields = [
            "id", "slug", "title", "content", "excerpt", "cover_image",
            "author_name", "category", "category_name", "tags", "status",
            "published_at", "seo_title", "seo_description", "created_at",
        ]
        read_only_fields = ["id", "slug", "created_at"]

    def get_author_name(self, obj):
        return obj.author.full_name if obj.author else None
