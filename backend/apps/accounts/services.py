from django.contrib.auth import get_user_model
from .tokens import make_email_verify_token, make_password_reset_token

User = get_user_model()


def send_verification_email_async(user: User) -> None:
    from .tasks import send_verification_email
    token = make_email_verify_token(user)
    send_verification_email.delay(user.pk, token)


def send_password_reset_email_async(user: User) -> None:
    from .tasks import send_password_reset_email
    token = make_password_reset_token(user)
    send_password_reset_email.delay(user.pk, token)


def verify_user_email(token: str) -> User:
    from .tokens import read_email_verify_token
    user = read_email_verify_token(token)
    if user.email_verified:
        return user
    user.email_verified = True
    user.save(update_fields=["email_verified"])
    return user


def reset_user_password(token: str, new_password: str) -> User:
    from .tokens import read_password_reset_token
    user = read_password_reset_token(token)
    user.set_password(new_password)
    user.save(update_fields=["password"])
    return user
