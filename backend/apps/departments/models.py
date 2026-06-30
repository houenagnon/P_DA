from django.conf import settings
from django.db import models
from apps.common.mixins import TimestampMixin


class Department(TimestampMixin):
    name = models.CharField(max_length=200, unique=True, verbose_name="Nom")
    description = models.TextField(blank=True)
    head = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="headed_departments",
        verbose_name="Responsable",
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="departments",
        verbose_name="Membres",
    )

    class Meta:
        verbose_name = "Département"
        ordering = ["name"]

    def __str__(self):
        return self.name


class DepartmentAnnouncement(TimestampMixin):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="announcements")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=300)
    content = models.TextField()

    class Meta:
        ordering = ["-created_at"]
