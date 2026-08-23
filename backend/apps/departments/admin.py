from django import forms
from django.contrib import admin
from django.db.models import Q
from .models import Department


class DepartmentAdminForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = ["name", "description", "lead", "co_lead"]

    def clean(self):
        cleaned = super().clean()
        lead = cleaned.get("lead")
        co_lead = cleaned.get("co_lead")

        if lead and co_lead and lead.id == co_lead.id:
            raise forms.ValidationError("Le responsable et l'adjoint ne peuvent pas être la même personne.")

        others = Department.objects.all()
        if self.instance and self.instance.pk:
            others = others.exclude(pk=self.instance.pk)

        for person, label in ((lead, "responsable"), (co_lead, "adjoint")):
            if person and others.filter(Q(lead=person) | Q(co_lead=person)).exists():
                raise forms.ValidationError(
                    f"{person.full_name} est déjà responsable ou adjoint d'un autre "
                    f"département — impossible de le désigner {label} ici aussi."
                )

        return cleaned


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    form = DepartmentAdminForm
    list_display = ["name", "lead", "co_lead", "created_at"]
    search_fields = ["name"]
    autocomplete_fields = ["lead", "co_lead"]
