from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("memberships", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.DeleteModel(name="MembershipComment"),
        migrations.DeleteModel(name="MembershipApplication"),
        migrations.CreateModel(
            name="Candidature",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("first_name", models.CharField(max_length=100, verbose_name="Prénom")),
                ("last_name", models.CharField(max_length=100, verbose_name="Nom")),
                ("email", models.EmailField(unique=True, verbose_name="Email")),
                ("phone", models.CharField(blank=True, max_length=20, verbose_name="Téléphone")),
                ("country", models.CharField(max_length=100, verbose_name="Pays")),
                ("profession", models.CharField(max_length=150, verbose_name="Profession")),
                ("linkedin_url", models.URLField(blank=True, verbose_name="LinkedIn")),
                ("motivation", models.TextField(verbose_name="Motivation")),
                ("status", models.CharField(
                    choices=[("pending", "En attente"), ("accepted", "Acceptée"), ("rejected", "Rejetée")],
                    default="pending", max_length=20, verbose_name="Statut",
                )),
                ("rejection_reason", models.TextField(blank=True, verbose_name="Motif de refus")),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("reviewed_by", models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name="reviewed_candidatures", to=settings.AUTH_USER_MODEL,
                )),
                ("user", models.OneToOneField(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name="candidature", to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "Candidature",
                "verbose_name_plural": "Candidatures",
                "ordering": ["-created_at"],
            },
        ),
    ]
