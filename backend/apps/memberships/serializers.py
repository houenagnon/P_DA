from rest_framework import serializers
from .models import Candidature


MAX_CV_SIZE = 5 * 1024 * 1024  # 5 Mo


class CandidatureCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = [
            "first_name", "last_name", "email", "phone",
            "country", "profession", "linkedin_url", "motivation", "cv",
        ]
        # Le champ email est unique en base ; on désactive le UniqueValidator
        # automatique de DRF pour appliquer notre propre règle métier ci-dessous
        # (une resoumission après refus doit être autorisée, pas bloquée).
        extra_kwargs = {"email": {"validators": []}, "cv": {"required": False}}

    def validate_cv(self, value):
        if value and value.size > MAX_CV_SIZE:
            raise serializers.ValidationError("Le CV ne doit pas dépasser 5 Mo.")
        return value

    def validate_email(self, value):
        existing = Candidature.objects.filter(email=value).exclude(status=Candidature.STATUS_REJECTED).first()
        if existing:
            if existing.status == Candidature.STATUS_ACCEPTED:
                raise serializers.ValidationError(
                    "Cette adresse email est déjà associée à un membre accepté de Data Afrique Hub."
                )
            raise serializers.ValidationError(
                "Une candidature est déjà en cours de traitement avec cet email."
            )
        return value

    def create(self, validated_data):
        # Resoumission après un refus précédent : on met à jour la candidature
        # existante plutôt que d'en créer une nouvelle (contrainte unique sur l'email).
        existing = Candidature.objects.filter(
            email=validated_data["email"], status=Candidature.STATUS_REJECTED,
        ).first()
        if existing:
            for field, value in validated_data.items():
                setattr(existing, field, value)
            existing.status = Candidature.STATUS_PENDING
            existing.rejection_reason = ""
            existing.reviewed_at = None
            existing.reviewed_by = None
            existing.save()
            return existing
        return super().create(validated_data)


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
    cv = serializers.FileField(read_only=True)

    class Meta:
        model = Candidature
        fields = [
            "id", "first_name", "last_name", "email", "phone", "country",
            "profession", "linkedin_url", "motivation", "cv", "status",
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
