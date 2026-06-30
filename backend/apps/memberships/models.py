from django.conf import settings
from django.db import models
from apps.common.mixins import TimestampMixin


class Candidature(TimestampMixin):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_REJECTED = "rejected"

    STATUS_CHOICES = [
        (STATUS_PENDING, "En attente"),
        (STATUS_ACCEPTED, "Acceptée"),
        (STATUS_REJECTED, "Rejetée"),
    ]

    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    email = models.EmailField(unique=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    country = models.CharField(max_length=100, verbose_name="Pays")
    profession = models.CharField(max_length=150, verbose_name="Profession")
    linkedin_url = models.URLField(blank=True, verbose_name="LinkedIn")
    motivation = models.TextField(verbose_name="Motivation")

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING,
        verbose_name="Statut",
    )
    rejection_reason = models.TextField(blank=True, verbose_name="Motif de refus")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="reviewed_candidatures",
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="candidature",
    )

    class Meta:
        verbose_name = "Candidature"
        verbose_name_plural = "Candidatures"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} <{self.email}> — {self.get_status_display()}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
