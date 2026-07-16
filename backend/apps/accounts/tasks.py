from urllib.parse import quote
from celery import shared_task
from django.conf import settings

from apps.common.email import send_transactional_email


@shared_task(bind=True, max_retries=3)
def send_verification_email(self, user_pk: int, token: str):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return

    # Le token signé (django.core.signing) contient des ":" — beaucoup de clients
    # email (Gmail, Outlook...) coupent l'auto-détection de lien à ce caractère dans
    # un email en texte brut, pensant qu'il introduit un nouveau protocole. On encode
    # le token pour que le lien reste cliquable intégralement.
    verify_url = f"{settings.FRONTEND_URL}/verify-email/{quote(token, safe='')}"
    send_transactional_email(
        subject="Vérifiez votre adresse email — Data Afrique Hub",
        message=f"Bonjour {user.first_name},\n\nCliquez sur ce lien pour vérifier votre email :\n{verify_url}\n\nCe lien expire dans 24h.",
        recipient_list=[user.email],
    )


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_pk: int, token: str):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return

    reset_url = f"{settings.FRONTEND_URL}/reset-password/{quote(token, safe='')}"
    send_transactional_email(
        subject="Réinitialisation de mot de passe — Data Afrique Hub",
        message=f"Bonjour {user.first_name},\n\nCliquez sur ce lien pour réinitialiser votre mot de passe :\n{reset_url}\n\nCe lien expire dans 24h.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.",
        recipient_list=[user.email],
    )
