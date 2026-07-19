from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError


def _sync_lead_roles(department) -> None:
    """Nommer quelqu'un lead/co-lead lui attribue automatiquement le rôle
    responsable_departement. Le retirer ne fait pas revenir son rôle en arrière
    (on ne sait pas quel était son rôle avant) — l'admin le change manuellement."""
    from apps.accounts.models import ROLES

    for user in filter(None, [department.lead, department.co_lead]):
        if user.role != ROLES.RESPONSABLE_DEPARTEMENT:
            user.role = ROLES.RESPONSABLE_DEPARTEMENT
            user.save(update_fields=["role"])


def save_department(serializer) -> "Department":
    department = serializer.save()
    _sync_lead_roles(department)
    return department


def add_member(department, user, start_date, end_date=None) -> "DepartmentMembership":
    from .models import DepartmentMembership

    with transaction.atomic():
        today = timezone.now().date()
        # Un membre n'a qu'une seule adhésion active à la fois, tous départements confondus.
        active_memberships = DepartmentMembership.objects.select_for_update().filter(
            user=user,
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=today))
        for membership in active_memberships:
            membership.end_date = start_date
            membership.save(update_fields=["end_date"])

        return DepartmentMembership.objects.create(
            department=department, user=user, start_date=start_date, end_date=end_date,
        )


def end_membership(membership, end_date=None) -> "DepartmentMembership":
    membership.end_date = end_date or timezone.now().date()
    if membership.end_date < membership.start_date:
        raise ValidationError("La date de fin ne peut pas précéder la date de début.")
    membership.save(update_fields=["end_date"])
    return membership
