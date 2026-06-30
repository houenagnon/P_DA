from django.core import signing
from django.contrib.auth import get_user_model

User = get_user_model()

EMAIL_VERIFY_SALT = "dah-email-verify"
PASSWORD_RESET_SALT = "dah-password-reset"
TOKEN_MAX_AGE = 86400  # 24h


def make_token(user_pk: int, salt: str) -> str:
    return signing.dumps(user_pk, salt=salt)


def read_token(token: str, salt: str, max_age: int = TOKEN_MAX_AGE) -> int:
    try:
        return signing.loads(token, salt=salt, max_age=max_age)
    except signing.SignatureExpired:
        raise ValueError("Le lien a expiré.")
    except signing.BadSignature:
        raise ValueError("Lien invalide.")


def make_email_verify_token(user: User) -> str:
    return make_token(user.pk, EMAIL_VERIFY_SALT)


def read_email_verify_token(token: str) -> User:
    pk = read_token(token, EMAIL_VERIFY_SALT)
    return User.objects.get(pk=pk)


def make_password_reset_token(user: User) -> str:
    return make_token(user.pk, PASSWORD_RESET_SALT)


def read_password_reset_token(token: str) -> User:
    pk = read_token(token, PASSWORD_RESET_SALT)
    return User.objects.get(pk=pk)


