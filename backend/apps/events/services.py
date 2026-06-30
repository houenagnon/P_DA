import io
import logging
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)


def register_participant(event, user, motivation: str = "") -> "EventParticipant":
    from .models import EventParticipant

    with transaction.atomic():
        event_locked = type(event).objects.select_for_update().get(pk=event.pk)

        if event_locked.registration_deadline and timezone.now() > event_locked.registration_deadline:
            raise ValidationError("Les inscriptions sont closes pour cet événement.")

        if event_locked.is_full:
            raise ValidationError("Cet événement est complet.")

        participant, created = EventParticipant.objects.get_or_create(
            event=event_locked,
            user=user,
            defaults={"motivation": motivation},
        )
        if not created:
            raise ValidationError("Vous êtes déjà inscrit à cet événement.")

        logger.info("Inscription : %s → %s", user.email, event.title)
        return participant


def validate_presence(event, user) -> "EventParticipant":
    from .models import EventParticipant

    try:
        participant = EventParticipant.objects.get(event=event, user=user)
    except EventParticipant.DoesNotExist:
        raise ValidationError("Cet utilisateur n'est pas inscrit à cet événement.")

    if participant.presence_validated:
        raise ValidationError("La présence a déjà été validée.")

    participant.presence_validated = True
    participant.attended_at = timezone.now()
    participant.save(update_fields=["presence_validated", "attended_at"])
    return participant


def generate_qr_code(event) -> None:
    import qrcode
    from django.core.files.base import ContentFile
    from django.conf import settings

    url = f"{settings.FRONTEND_URL}/events/{event.pk}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    event.qr_code.save(f"qr_{event.pk}.png", ContentFile(buffer.getvalue()), save=True)


def export_participants_excel(event) -> bytes:
    import openpyxl
    from openpyxl.styles import Font

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Participants"

    headers = ["Prénom", "Nom", "Email", "Inscrit le", "Présence validée", "Heure d'arrivée"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = Font(bold=True)

    for row, p in enumerate(event.participants.select_related("user").all(), 2):
        ws.cell(row=row, column=1, value=p.user.first_name)
        ws.cell(row=row, column=2, value=p.user.last_name)
        ws.cell(row=row, column=3, value=p.user.email)
        ws.cell(row=row, column=4, value=p.created_at.strftime("%d/%m/%Y %H:%M"))
        ws.cell(row=row, column=5, value="Oui" if p.presence_validated else "Non")
        ws.cell(row=row, column=6, value=p.attended_at.strftime("%d/%m/%Y %H:%M") if p.attended_at else "")

    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()
