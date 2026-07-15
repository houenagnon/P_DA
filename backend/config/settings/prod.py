from .base import *  # noqa
from decouple import config, Csv

DEBUG = False

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Render fournit automatiquement le hostname externe du service.
RENDER_EXTERNAL_HOSTNAME = config("RENDER_EXTERNAL_HOSTNAME", default="")
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)  # noqa

CSRF_TRUSTED_ORIGINS = [o for o in config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv()) if o]
if RENDER_EXTERNAL_HOSTNAME:
    CSRF_TRUSTED_ORIGINS.append(f"https://{RENDER_EXTERNAL_HOSTNAME}")

# WhiteNoise sert les fichiers statiques directement depuis Gunicorn (pas de Redis/nginx nécessaire).
# Cloudinary sert les fichiers média : le disque de Render n'est pas persistant
# (effacé à chaque redéploiement), ce qui rendait les fichiers uploadés (CV,
# avatars...) inaccessibles après coup malgré leur référence en base.
STORAGES = {
    "default": {"BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# Pas de worker Celery/Redis déployé sur ce plan gratuit : les tâches (emails)
# s'exécutent de façon synchrone dans la requête via le SMTP Brevo.
# EAGER_PROPAGATES=True est nécessaire : sans ça, toute erreur d'envoi (SMTP down,
# timeout...) est avalée silencieusement par Celery en mode eager et n'atteint
# jamais les try/except qui sont censés la loguer (aucune erreur ni confirmation
# n'apparaît alors dans les logs). Les appelants (.delay()) sont déjà tous protégés
# par un try/except, donc une erreur d'email ne fait pas planter la requête HTTP.
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Les emails sont envoyés via l'API HTTP de Brevo (apps.common.email), pas via le
# backend SMTP de Django — voir settings.BREVO_API_KEY dans base.py.
