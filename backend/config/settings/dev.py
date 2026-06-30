from .base import *  # noqa

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Mailpit — serveur SMTP local (intégré dans docker-compose.yml)
# UI disponible sur http://localhost:8025
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST", default="localhost")
EMAIL_PORT = config("EMAIL_PORT", default=1025, cast=int)
EMAIL_USE_TLS = False
EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""

# Celery s'exécute de façon synchrone en dev (pas besoin de Redis)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = False  # les erreurs de tâche ne plantent pas la vue

INSTALLED_APPS += ["debug_toolbar"]  # noqa

MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]  # noqa

INTERNAL_IPS = ["127.0.0.1"]

# Logs SQL en dev
LOGGING["loggers"]["django.db.backends"] = {  # noqa
    "handlers": ["console"],
    "level": "DEBUG",
    "propagate": False,
}
