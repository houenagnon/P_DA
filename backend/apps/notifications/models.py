from django.conf import settings
from django.db import models
from apps.common.mixins import TimestampMixin


class Notification(TimestampMixin):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification"

    def __str__(self):
        return f"{self.user.email} — {self.title}"


def notify(user, title: str, body: str, link: str = "") -> Notification:
    return Notification.objects.create(user=user, title=title, body=body, link=link)
