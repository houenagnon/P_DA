from celery import shared_task
from django.conf import settings

from apps.common.email import send_transactional_email as _send_email


@shared_task(bind=True, max_retries=3)
def send_event_registration_confirmation(self, participant_pk: int):
    from .models import EventParticipant

    try:
        participant = EventParticipant.objects.select_related("event").get(pk=participant_pk)
    except EventParticipant.DoesNotExist:
        return

    event = participant.event
    event_url = f"{settings.FRONTEND_URL}/events/{event.pk}"

    details = f"Date  : {event.start_date:%d/%m/%Y à %H:%M}\n"
    if event.location:
        details += f"Lieu  : {event.location}\n"
    if event.online_link:
        details += f"Lien de connexion : {event.online_link}\n"

    _send_email(
        subject=f"Confirmation d'inscription — {event.title}",
        message=(
            f"Bonjour {participant.first_name},\n\n"
            f"Votre inscription à l'évènement « {event.title} » est confirmée.\n\n"
            f"{details}\n"
            f"Plus de détails : {event_url}\n\n"
            f"À bientôt,\n"
            f"L'équipe Data Afrique Hub"
        ),
        recipient_list=[participant.email],
    )
