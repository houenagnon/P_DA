from django.conf import settings
from django.db import models
from apps.common.mixins import TimestampMixin


class Department(TimestampMixin):
    name = models.CharField(max_length=200, unique=True, verbose_name="Nom")
    description = models.TextField(blank=True)
    lead = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="led_departments",
        verbose_name="Responsable",
    )
    co_lead = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="co_led_departments",
        verbose_name="Co-responsable",
    )

    class Meta:
        verbose_name = "Département"
        ordering = ["name"]

    def __str__(self):
        return self.name


class DepartmentMembership(TimestampMixin):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="department_memberships",
    )
    start_date = models.DateField(verbose_name="Depuis le")
    end_date = models.DateField(null=True, blank=True, verbose_name="Jusqu'au")

    class Meta:
        verbose_name = "Adhésion à un département"
        verbose_name_plural = "Adhésions à un département"
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.user.full_name} → {self.department.name}"


class DepartmentAnnouncement(TimestampMixin):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="announcements")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=300)
    content = models.TextField()

    class Meta:
        ordering = ["-created_at"]
