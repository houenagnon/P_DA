import logging
import threading

logger = logging.getLogger(__name__)


def fire_and_forget(func, *args, error_message: str = "Tâche en arrière-plan échouée", **kwargs) -> None:
    """Exécute func(*args, **kwargs) dans un thread séparé, sans bloquer la requête
    en cours. Utilisé pour les envois d'email : sur ce déploiement (pas de worker
    Celery/Redis), les envoyer de façon synchrone dans la requête HTTP risquait de
    dépasser le timeout de Gunicorn (surtout quand plusieurs emails sont envoyés à
    la suite) et de tuer le worker en cours de traitement."""

    def _run():
        try:
            func(*args, **kwargs)
        except Exception:
            logger.exception(error_message)

    threading.Thread(target=_run, daemon=True).start()
