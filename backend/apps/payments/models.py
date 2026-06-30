import uuid
from django.conf import settings
from django.db import models
from apps.common.mixins import TimestampMixin


PAYMENT_STATUS_CHOICES = [
    ("pending", "En attente"),
    ("completed", "Complété"),
    ("failed", "Échoué"),
    ("refunded", "Remboursé"),
]

PROVIDER_CHOICES = [
    ("cinetpay", "CinetPay"),
    ("stripe", "Stripe"),
    ("manual", "Manuel"),
    ("mobile_money", "Mobile Money"),
]


class Payment(TimestampMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="XOF")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending")
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default="manual")
    provider_reference = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    year = models.PositiveIntegerField(help_text="Année de cotisation")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Paiement"

    def __str__(self):
        return f"{self.user.full_name} — {self.amount} {self.currency} ({self.year})"
