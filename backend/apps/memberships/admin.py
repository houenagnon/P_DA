from django.contrib import admin
from .models import Candidature


@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email", "country", "profession", "status", "created_at"]
    list_filter = ["status", "country"]
    search_fields = ["first_name", "last_name", "email"]
    readonly_fields = ["reviewed_at", "reviewed_by", "user", "created_at", "updated_at"]
