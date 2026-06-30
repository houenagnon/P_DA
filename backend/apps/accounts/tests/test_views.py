import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="merveille@dah.com", password="securepass123",
        first_name="Merveille", last_name="Houenagnon",
        email_verified=True,
    )


@pytest.fixture
def auth_client(client, user):
    response = client.post(reverse("auth-login"), {"email": user.email, "password": "securepass123"})
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    return client


@pytest.mark.django_db
class TestRegisterView:
    def test_register_success(self, client):
        response = client.post(reverse("auth-register"), {
            "email": "new@dah.com",
            "first_name": "Nouveau",
            "last_name": "Membre",
            "password": "securepass123",
            "password_confirm": "securepass123",
        })
        assert response.status_code == 201
        assert User.objects.filter(email="new@dah.com").exists()

    def test_register_password_mismatch(self, client):
        response = client.post(reverse("auth-register"), {
            "email": "new@dah.com",
            "first_name": "X", "last_name": "Y",
            "password": "securepass123",
            "password_confirm": "wrongpass123",
        })
        assert response.status_code == 400

    def test_register_duplicate_email(self, client, user):
        response = client.post(reverse("auth-register"), {
            "email": user.email,
            "first_name": "X", "last_name": "Y",
            "password": "securepass123",
            "password_confirm": "securepass123",
        })
        assert response.status_code == 400


@pytest.mark.django_db
class TestLoginView:
    def test_login_success(self, client, user):
        response = client.post(reverse("auth-login"), {
            "email": user.email, "password": "securepass123",
        })
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["role"] == "visiteur"

    def test_login_wrong_password(self, client, user):
        response = client.post(reverse("auth-login"), {
            "email": user.email, "password": "wrongpass",
        })
        assert response.status_code == 401


@pytest.mark.django_db
class TestMeView:
    def test_me_authenticated(self, auth_client, user):
        response = auth_client.get(reverse("auth-me"))
        assert response.status_code == 200
        assert response.data["email"] == user.email

    def test_me_unauthenticated(self, client):
        response = client.get(reverse("auth-me"))
        assert response.status_code == 401

    def test_me_update(self, auth_client):
        response = auth_client.patch(reverse("auth-me"), {"phone": "+22961000000"})
        assert response.status_code == 200
        assert response.data["phone"] == "+22961000000"
