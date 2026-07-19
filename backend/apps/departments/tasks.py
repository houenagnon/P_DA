from celery import shared_task
from django.conf import settings

from apps.common.email import send_transactional_email as _send_email

ROLE_LABELS = {"lead": "responsable", "co_lead": "co-responsable"}


@shared_task(bind=True, max_retries=3)
def send_member_added_email(self, membership_pk: int):
    from .models import DepartmentMembership

    try:
        membership = DepartmentMembership.objects.select_related("department", "user").get(pk=membership_pk)
    except DepartmentMembership.DoesNotExist:
        return

    _send_email(
        subject=f"Vous rejoignez le département {membership.department.name} — Data Afrique Hub",
        message=(
            f"Bonjour {membership.user.first_name},\n\n"
            f"Vous avez été ajouté(e) au département « {membership.department.name} » "
            f"depuis le {membership.start_date:%d/%m/%Y}.\n\n"
            f"À bientôt,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[membership.user.email],
    )


@shared_task(bind=True, max_retries=3)
def send_membership_ended_email(self, membership_pk: int):
    from .models import DepartmentMembership

    try:
        membership = DepartmentMembership.objects.select_related("department", "user").get(pk=membership_pk)
    except DepartmentMembership.DoesNotExist:
        return

    _send_email(
        subject=f"Fin de votre adhésion au département {membership.department.name} — Data Afrique Hub",
        message=(
            f"Bonjour {membership.user.first_name},\n\n"
            f"Votre adhésion au département « {membership.department.name} » a pris fin "
            f"le {membership.end_date:%d/%m/%Y}.\n\n"
            f"Merci pour votre contribution,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[membership.user.email],
    )


@shared_task(bind=True, max_retries=3)
def send_lead_appointed_email(self, department_pk: int, user_pk: int, role: str):
    from django.contrib.auth import get_user_model
    from .models import Department
    User = get_user_model()

    try:
        department = Department.objects.get(pk=department_pk)
        user = User.objects.get(pk=user_pk)
    except (Department.DoesNotExist, User.DoesNotExist):
        return

    role_label = ROLE_LABELS.get(role, role)
    _send_email(
        subject=f"Vous êtes {role_label} du département {department.name} — Data Afrique Hub",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"Vous avez été nommé(e) {role_label} du département « {department.name} ».\n\n"
            f"Vous pouvez désormais gérer ses membres, publier des annonces, organiser "
            f"les séances et suivre les tâches de l'équipe.\n\n"
            f"À bientôt,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[user.email],
    )


@shared_task(bind=True, max_retries=3)
def send_announcement_email(self, announcement_pk: int):
    from django.db.models import Q
    from django.utils import timezone
    from .models import DepartmentAnnouncement

    try:
        announcement = DepartmentAnnouncement.objects.select_related("department").get(pk=announcement_pk)
    except DepartmentAnnouncement.DoesNotExist:
        return

    today = timezone.now().date()
    recipients = list(
        announcement.department.memberships
        .filter(Q(end_date__isnull=True) | Q(end_date__gte=today))
        .values_list("user__email", flat=True)
    )
    if not recipients:
        return

    _send_email(
        subject=f"[{announcement.department.name}] {announcement.title}",
        message=(
            f"Nouvelle annonce dans le département « {announcement.department.name} » :\n\n"
            f"{announcement.title}\n\n{announcement.content}\n\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=recipients,
    )


@shared_task(bind=True, max_retries=3)
def send_session_reminder_email(self, session_pk: int):
    from django.db.models import Q
    from django.utils import timezone
    from .models import DepartmentSession

    try:
        session = DepartmentSession.objects.select_related("department").get(pk=session_pk)
    except DepartmentSession.DoesNotExist:
        return

    today = timezone.now().date()
    recipients = list(
        session.department.memberships
        .filter(Q(end_date__isnull=True) | Q(end_date__gte=today))
        .values_list("user__email", flat=True)
    )
    if not recipients:
        return

    theme_line = f"Thème : {session.theme}\n" if session.theme else ""
    _send_email(
        subject=f"Rappel — Séance du département {session.department.name}",
        message=(
            f"Rappel : une séance du département « {session.department.name} » est prévue "
            f"le {session.date:%d/%m/%Y}.\n\n"
            f"{theme_line}\n"
            f"À bientôt,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=recipients,
    )


@shared_task(bind=True, max_retries=3)
def send_task_assigned_email(self, task_pk: int):
    from .models import DepartmentTask

    try:
        task = DepartmentTask.objects.select_related("department", "assigned_to").get(pk=task_pk)
    except DepartmentTask.DoesNotExist:
        return
    if not task.assigned_to:
        return

    due_line = f"Échéance : {task.due_date:%d/%m/%Y}\n" if task.due_date else ""
    task_url = f"{settings.FRONTEND_URL}/my-department"
    _send_email(
        subject=f"Nouvelle tâche assignée — {task.department.name}",
        message=(
            f"Bonjour {task.assigned_to.first_name},\n\n"
            f"Une nouvelle tâche vous a été assignée dans le département « {task.department.name} » :\n\n"
            f"{task.title}\n{task.description}\n\n{due_line}\n"
            f"Voir mes tâches : {task_url}\n\n"
            f"À bientôt,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[task.assigned_to.email],
    )
