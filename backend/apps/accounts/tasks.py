from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task(bind=True, max_retries=3)
def send_verification_email(self, user_pk: int, token: str):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return

    verify_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
    send_mail(
        subject="Vérifiez votre adresse email — Data Afrique Hub",
        message=f"Bonjour {user.first_name},\n\nCliquez sur ce lien pour vérifier votre email :\n{verify_url}\n\nCe lien expire dans 24h.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_pk: int, token: str):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return

    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
    send_mail(
        subject="Réinitialisation de mot de passe — Data Afrique Hub",
        message=f"Bonjour {user.first_name},\n\nCliquez sur ce lien pour réinitialiser votre mot de passe :\n{reset_url}\n\nCe lien expire dans 24h.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
