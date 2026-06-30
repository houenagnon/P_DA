import logging
import random
import secrets
import string
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

User = get_user_model()


def accept_candidature(candidature, reviewed_by) -> "Candidature":
    from .models import Candidature
    from .tasks import send_welcome_email
    from apps.members.models import MemberProfile

    if candidature.status != Candidature.STATUS_PENDING:
        raise ValidationError("Seules les candidatures en attente peuvent être acceptées.")

    temp_password = _generate_temp_password()
    user = User.objects.create_user(
        email=candidature.email,
        first_name=candidature.first_name,
        last_name=candidature.last_name,
        phone=candidature.phone,
        role="membre",
        password=temp_password,
    )

    profile, _ = MemberProfile.objects.get_or_create(user=user)
    if not profile.member_number:
        profile.member_number = _generate_member_number()
        profile.save(update_fields=["member_number"])

    candidature.status = Candidature.STATUS_ACCEPTED
    candidature.reviewed_by = reviewed_by
    candidature.reviewed_at = timezone.now()
    candidature.user = user
    candidature.save(update_fields=["status", "reviewed_by", "reviewed_at", "user"])

    try:
        send_welcome_email.delay(user.pk, temp_password)
    except Exception:
        logger.exception("Impossible d'envoyer l'email de bienvenue à %s", user.email)

    return candidature


def reject_candidature(candidature, reviewed_by, reason: str) -> "Candidature":
    from .models import Candidature
    from .tasks import send_rejection_email

    if candidature.status != Candidature.STATUS_PENDING:
        raise ValidationError("Seules les candidatures en attente peuvent être refusées.")

    candidature.status = Candidature.STATUS_REJECTED
    candidature.reviewed_by = reviewed_by
    candidature.reviewed_at = timezone.now()
    candidature.rejection_reason = reason
    candidature.save(update_fields=["status", "reviewed_by", "reviewed_at", "rejection_reason"])

    try:
        send_rejection_email.delay(candidature.email, candidature.first_name, reason)
    except Exception:
        logger.exception("Impossible d'envoyer l'email de refus à %s", candidature.email)

    return candidature


def _generate_temp_password() -> str:
    chars = string.ascii_letters + string.digits
    while True:
        pwd = "".join(secrets.choice(chars) for _ in range(12))
        if any(c.isupper() for c in pwd) and any(c.islower() for c in pwd) and any(c.isdigit() for c in pwd):
            return pwd


def _generate_member_number() -> str:
    from apps.members.models import MemberProfile
    year = timezone.now().year
    suffix = "".join(random.choices(string.digits, k=4))
    number = f"DAH-{year}-{suffix}"
    while MemberProfile.objects.filter(member_number=number).exists():
        suffix = "".join(random.choices(string.digits, k=4))
        number = f"DAH-{year}-{suffix}"
    return number
