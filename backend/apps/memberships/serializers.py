from rest_framework import serializers
from .models import Candidature


class CandidatureCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = [
            "first_name", "last_name", "email", "phone",
            "country", "profession", "linkedin_url", "motivation",
        ]

    def validate_email(self, value):
        if Candidature.objects.filter(email=value).exclude(status=Candidature.STATUS_REJECTED).exists():
            raise serializers.ValidationError(
                "Une candidature est déjà en cours avec cet email."
            )
        return value


class CandidatureListSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source="reviewed_by.full_name", read_only=True, default=None)

    class Meta:
        model = Candidature
        fields = [
            "id", "first_name", "last_name", "email", "country",
            "profession", "status", "created_at", "reviewed_at", "reviewed_by_name",
        ]


class CandidatureDetailSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source="reviewed_by.full_name", read_only=True, default=None)

    class Meta:
        model = Candidature
        fields = [
            "id", "first_name", "last_name", "email", "phone", "country",
            "profession", "linkedin_url", "motivation", "status",
            "rejection_reason", "reviewed_at", "reviewed_by_name", "created_at",
        ]


class ReviewCandidatureSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["accept", "reject"])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["action"] == "reject" and not attrs.get("rejection_reason", "").strip():
            raise serializers.ValidationError(
                {"rejection_reason": "Le motif de refus est obligatoire."}
            )
        return attrs
