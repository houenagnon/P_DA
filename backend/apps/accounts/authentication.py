from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

# Endpoints où un compte non vérifié doit quand même pouvoir agir : consulter son
# statut, se déconnecter, changer son mot de passe, supprimer son compte, ou
# rafraîchir son token (nécessaire pour que l'app continue de fonctionner).
_EXEMPT_PATHS = {
    "/api/v1/auth/me/",
    "/api/v1/auth/logout/",
    "/api/v1/auth/token/refresh/",
    "/api/v1/auth/email/verify/",
    "/api/v1/auth/email/verify/resend/",
    "/api/v1/auth/password/change/",
    "/api/v1/auth/account/delete/",
}


class VerifiedJWTAuthentication(JWTAuthentication):
    """Comme JWTAuthentication, mais bloque l'accès aux fonctionnalités tant que
    l'email du compte n'est pas vérifié (sauf endpoints exemptés ci-dessus)."""

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        user, validated_token = result
        if not user.email_verified and request.path not in _EXEMPT_PATHS:
            raise PermissionDenied(
                "Veuillez vérifier votre adresse email pour accéder à cette fonctionnalité. "
                "Reconnectez-vous pour recevoir un nouveau lien de vérification."
            )
        return result
