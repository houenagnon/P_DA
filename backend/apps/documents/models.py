from django.conf import settings
from django.db import models
from apps.common.mixins import TimestampMixin


class DocumentFolder(TimestampMixin):
    name = models.CharField(max_length=200)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="subfolders")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name


class Document(TimestampMixin):
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    folder = models.ForeignKey(DocumentFolder, null=True, blank=True, on_delete=models.SET_NULL, related_name="documents")
    tags = models.CharField(max_length=500, blank=True, help_text="Tags séparés par des virgules")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def current_version(self):
        return self.versions.order_by("-version_number").first()


class DocumentVersion(TimestampMixin):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="versions")
    version_number = models.PositiveIntegerField(default=1)
    file = models.FileField(upload_to="documents/")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    changelog = models.TextField(blank=True)

    class Meta:
        ordering = ["-version_number"]
        unique_together = [("document", "version_number")]
