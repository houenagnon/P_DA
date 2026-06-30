from django.urls import path

from .views import (
    DAHTokenObtainPairView, DAHTokenRefreshView, LogoutView, MeView,
    PasswordChangeView, PasswordResetRequestView, PasswordResetConfirmView,
    EmailVerifyView, DeleteAccountView,
)

urlpatterns = [
    path("login/", DAHTokenObtainPairView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", DAHTokenRefreshView.as_view(), name="auth-token-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("password/change/", PasswordChangeView.as_view(), name="auth-password-change"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
    path("email/verify/", EmailVerifyView.as_view(), name="auth-email-verify"),
    path("account/delete/", DeleteAccountView.as_view(), name="auth-account-delete"),
]

