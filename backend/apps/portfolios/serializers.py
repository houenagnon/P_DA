from rest_framework import serializers
from .models import PortfolioProject


class PortfolioProjectSerializer(serializers.ModelSerializer):
    member_slug = serializers.CharField(source="member_profile.slug", read_only=True)
    member_name = serializers.SerializerMethodField()
    member_avatar = serializers.SerializerMethodField()
    tech_stack_list = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioProject
        fields = [
            "id", "title", "description", "tech_stack_list",
            "demo_url", "repo_url", "image", "is_featured",
            "member_slug", "member_name", "member_avatar", "created_at",
        ]

    def get_member_name(self, obj):
        return obj.member_profile.user.full_name

    def get_member_avatar(self, obj):
        avatar = obj.member_profile.user.avatar
        request = self.context.get("request")
        if avatar and request:
            return request.build_absolute_uri(avatar.url)
        return None

    def get_tech_stack_list(self, obj):
        return [t.strip() for t in obj.tech_stack.split(",") if t.strip()] if obj.tech_stack else []
