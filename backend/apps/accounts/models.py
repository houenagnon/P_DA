from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from apps.common.mixins import TimestampMixin


class ROLES:
    ADMIN = "admin"
    PRESIDENT = "president"
    VP1 = "vp1"
    VP2 = "vp2"
    SECRETAIRE_GENERAL = "secretaire_general"
    SECRETAIRE_GENERAL_ADJ = "secretaire_general_adj"
    TRESORIER = "tresorier"
    TRESORIER_ADJ = "tresorier_adj"
    RESPONSABLE_DEPARTEMENT = "responsable_departement"
    FORMATEUR = "formateur"
    MENTOR = "mentor"
    MEMBRE = "membre"
    CANDIDAT = "candidat"
    VISITEUR = "visiteur"

    CHOICES = [
        (ADMIN, "Administrateur"),
        (PRESIDENT, "Président"),
        (VP1, "Vice-Président 1"),
        (VP2, "Vice-Président 2"),
        (SECRETAIRE_GENERAL, "Secrétaire Général"),
        (SECRETAIRE_GENERAL_ADJ, "Secrétaire Général Adjoint"),
        (TRESORIER, "Trésorier Général"),
        (TRESORIER_ADJ, "Trésorier Général Adjoint"),
        (RESPONSABLE_DEPARTEMENT, "Responsable de Département"),
        (FORMATEUR, "Formateur"),
        (MENTOR, "Mentor"),
        (MEMBRE, "Membre"),
        (CANDIDAT, "Candidat"),
        (VISITEUR, "Visiteur"),
    ]


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", ROLES.ADMIN)
        extra_fields.setdefault("email_verified", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimestampMixin):
    email = models.EmailField(unique=True, verbose_name="Adresse email")
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True, verbose_name="Photo")
    role = models.CharField(
        max_length=30,
        choices=ROLES.CHOICES,
        default=ROLES.VISITEUR,
        verbose_name="Rôle",
    )
    email_verified = models.BooleanField(default=False, verbose_name="Email vérifié")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} <{self.email}>"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_bureau(self):
        from apps.common.permissions import BUREAU_ROLES
        return self.role in BUREAU_ROLES

    @property
    def is_admin(self):
        return self.role == ROLES.ADMIN
