from django.contrib import admin
from .models import Project, ProjectTask


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "status", "owner", "department", "deadline", "created_at"]
    list_filter = ["status", "department"]
    search_fields = ["title", "description"]


@admin.register(ProjectTask)
class ProjectTaskAdmin(admin.ModelAdmin):
    list_display = ["title", "project", "assigned_to", "due_date", "is_done"]
    list_filter = ["is_done"]
    search_fields = ["title"]
