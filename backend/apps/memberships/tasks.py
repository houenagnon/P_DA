import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _send_email(subject: str, message: str, recipient_list: list[str]) -> None:
    """Envoie un email et logue systématiquement son contenu (avant l'envoi), pour
    garder une trace exploitable même si le SMTP échoue ou tarde à répondre."""
    logger.info(
        "Envoi email — À: %s — Sujet: %s\n%s",
        ", ".join(recipient_list), subject, message,
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )


@shared_task(bind=True, max_retries=3)
def send_candidature_received_notification(self, candidature_pk: int):
    from .models import Candidature
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        c = Candidature.objects.get(pk=candidature_pk)
    except Candidature.DoesNotExist:
        return

    recipients = list(
        User.objects.filter(role__in=["admin", "president"], is_active=True)
        .values_list("email", flat=True)
    )
    if not recipients:
        return

    review_url = f"{settings.FRONTEND_URL}/manage/candidatures/{c.pk}/"
    _send_email(
        subject=f"Nouvelle candidature — {c.full_name}",
        message=(
            f"Une nouvelle candidature a été reçue.\n\n"
            f"Candidat : {c.full_name}\n"
            f"Email    : {c.email}\n"
            f"Pays     : {c.country}\n"
            f"Métier   : {c.profession}\n\n"
            f"Examiner la candidature : {review_url}"
        ),
        recipient_list=recipients,
    )


@shared_task(bind=True, max_retries=3)
def send_candidature_confirmation_email(self, candidature_pk: int):
    from .models import Candidature

    try:
        c = Candidature.objects.get(pk=candidature_pk)
    except Candidature.DoesNotExist:
        return

    _send_email(
        subject="Votre candidature a bien été reçue — Data Afrique Hub",
        message=(
            f"Bonjour {c.first_name},\n\n"
            f"Nous avons bien reçu votre candidature pour rejoindre la communauté "
            f"Data Afrique Hub. Notre équipe va l'examiner et reviendra vers vous "
            f"par email dès qu'une décision sera prise.\n\n"
            f"Récapitulatif de votre candidature :\n"
            f"  Pays     : {c.country}\n"
            f"  Profession : {c.profession}\n\n"
            f"Merci pour votre intérêt et à bientôt,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[c.email],
    )


@shared_task(bind=True, max_retries=3)
def send_welcome_email(self, user_pk: int, temp_password: str):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return

    login_url = f"{settings.FRONTEND_URL}/login"
    _send_email(
        subject="Bienvenue dans la communauté Data Afrique Hub !",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"Votre candidature a été acceptée. Vous faites maintenant partie de la communauté "
            f"Data Afrique Hub !\n\n"
            f"Voici vos identifiants de connexion :\n"
            f"  Email          : {user.email}\n"
            f"  Mot de passe   : {temp_password}\n\n"
            f"Connectez-vous ici : {login_url}\n\n"
            f"Nous vous recommandons de changer votre mot de passe après la première connexion "
            f"(Profil → Sécurité).\n\n"
            f"À bientôt,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[user.email],
    )


@shared_task(bind=True, max_retries=3)
def send_rejection_email(self, email: str, first_name: str, reason: str):
    _send_email(
        subject="Votre candidature — Data Afrique Hub",
        message=(
            f"Bonjour {first_name},\n\n"
            f"Nous avons examiné votre candidature pour rejoindre la communauté Data Afrique Hub "
            f"et nous avons le regret de vous informer qu'elle n'a pas été retenue.\n\n"
            f"Motif : {reason}\n\n"
            f"Nous vous encourageons à postuler de nouveau dans le futur.\n\n"
            f"Cordialement,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[email],
    )
