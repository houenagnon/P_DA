from rest_framework import serializers
from .models import Event, EventParticipant, EventSpeaker


class EventSpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSpeaker
        fields = ["id", "name", "bio", "photo", "user"]


class EventListSerializer(serializers.ModelSerializer):
    participant_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "title", "event_type", "cover_image", "recap_image",
            "start_date", "end_date", "registration_deadline",
            "location", "online_link", "is_published",
            "participant_count", "max_participants", "is_full", "is_registered",
        ]

    def get_is_registered(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.participants.filter(user=request.user).exists()


class EventDetailSerializer(serializers.ModelSerializer):
    speakers = EventSpeakerSerializer(many=True, read_only=True)
    participant_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_registered = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "event_type", "cover_image", "recap_image",
            "start_date", "end_date", "registration_deadline",
            "location", "online_link", "max_participants",
            "is_published", "qr_code", "created_by_name", "created_at",
            "speakers", "participant_count", "is_full", "is_registered",
        ]

    def get_is_registered(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.participants.filter(user=request.user).exists()


class EventWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "title", "description", "event_type", "cover_image", "recap_image",
            "start_date", "end_date", "registration_deadline",
            "location", "online_link", "max_participants", "is_published",
        ]


class EventParticipantSerializer(serializers.ModelSerializer):
    user_id = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="email", read_only=True)
    user_first_name = serializers.CharField(source="first_name", read_only=True)
    user_last_name = serializers.CharField(source="last_name", read_only=True)

    class Meta:
        model = EventParticipant
        fields = [
            "id", "user_id", "user_email", "user_first_name", "user_last_name",
            "nationality", "organisation", "profession",
            "created_at", "presence_validated", "attended_at", "motivation",
        ]

    def get_user_id(self, obj) -> int | None:
        return obj.user_id


class RegisterForEventSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    nationality = serializers.CharField(max_length=100)
    organisation = serializers.CharField(max_length=200)
    profession = serializers.CharField(max_length=150)
    motivation = serializers.CharField()


class ParticipantLookupSerializer(serializers.Serializer):
    email = serializers.EmailField()
