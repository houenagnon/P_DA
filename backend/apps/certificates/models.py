import uuid
from django.conf import settings
from django.db import models
from apps.common.mixins import TimestampMixin


class Certificate(TimestampMixin):
    CERT_PARTICIPATION = "participation"
    CERT_FORMATION = "formation"
    CERT_COMPETENCE = "competence"

    TYPE_CHOICES = [
        (CERT_PARTICIPATION, "Certificat de participation"),
        (CERT_FORMATION, "Certificat de formation"),
        (CERT_COMPETENCE, "Certificat de compétence"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificates")
    cert_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=300)
    issued_at = models.DateTimeField(auto_now_add=True)
    event = models.ForeignKey(
        "events.Event", null=True, blank=True, on_delete=models.SET_NULL, related_name="certificates"
    )
    pdf_file = models.FileField(upload_to="certificates/", null=True, blank=True)
    qr_code = models.ImageField(upload_to="certificates/qr/", null=True, blank=True)
    is_valid = models.BooleanField(default=True)

    class Meta:
        ordering = ["-issued_at"]
        verbose_name = "Certificat"

    def __str__(self):
        return f"{self.title} — {self.user.full_name}"

    @property
    def verify_url(self):
        return f"{settings.FRONTEND_URL}/certificates/verify/{self.pk}"
