import logging
import time

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

_BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
_MAX_ATTEMPTS = 3


def send_transactional_email(subject: str, message: str, recipient_list: list[str]) -> None:
    """Envoie un email via l'API HTTP de Brevo (port 443) plutôt que le SMTP brut
    (port 587), dont la connexion sortante depuis Render (plan gratuit) subit des
    coupures réseau intermittentes (TimeoutError). Logue le contenu avant l'envoi
    pour garder une trace exploitable même en cas d'échec."""
    logger.info(
        "Envoi email — À: %s — Sujet: %s\n%s",
        ", ".join(recipient_list), subject, message,
    )
    payload = {
        "sender": {"email": settings.DEFAULT_FROM_EMAIL},
        "to": [{"email": addr} for addr in recipient_list],
        "subject": subject,
        "textContent": message,
    }
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            response = requests.post(_BREVO_API_URL, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return
        except requests.RequestException:
            if attempt == _MAX_ATTEMPTS:
                raise
            logger.warning(
                "Envoi email à %s : tentative %s/%s échouée, nouvel essai...",
                ", ".join(recipient_list), attempt, _MAX_ATTEMPTS,
            )
            time.sleep(1)
