"""
Management command: python manage.py seed_dah
Crée des données de démonstration pour DAH.
"""
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with demonstration data for DAH"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Début du seed DAH...")
        self._create_users()
        self._create_events()
        self._create_profiles()
        self._create_memberships()
        self._create_departments()
        self.stdout.write(self.style.SUCCESS("✅ Seed terminé avec succès!"))

    def _create_users(self):
        self.stdout.write("  → Création des utilisateurs...")
        self.users = {}

        definitions = [
            dict(email="admin@dah.com", first_name="Directeur", last_name="Admin",
                 role="admin", phone="+22961000001", is_staff=True, is_superuser=True),
            dict(email="president@dah.com", first_name="Kouamé", last_name="Assouman",
                 role="president", phone="+22561000002"),
            dict(email="tresorier@dah.com", first_name="Fatou", last_name="Diallo",
                 role="tresorier", phone="+22161000003"),
            dict(email="sg@dah.com", first_name="Moussa", last_name="Konaté",
                 role="secretaire_general", phone="+22361000004"),
            dict(email="alice@dah.com", first_name="Alice", last_name="Mensah",
                 role="membre", phone="+22661000005"),
            dict(email="bob@dah.com", first_name="Robert", last_name="Ouedraogo",
                 role="membre", phone="+22761000006"),
            dict(email="claire@dah.com", first_name="Claire", last_name="Gbénou",
                 role="formateur", phone="+22961000007"),
            dict(email="david@dah.com", first_name="David", last_name="Ahiable",
                 role="mentor", phone="+22961000008"),
            dict(email="emma@dah.com", first_name="Emma", last_name="Toure",
                 role="candidat", phone="+22961000009"),
            dict(email="felix@dah.com", first_name="Félix", last_name="Bamba",
                 role="candidat", phone="+22961000010"),
        ]

        for d in definitions:
            is_staff = d.pop("is_staff", False)
            is_superuser = d.pop("is_superuser", False)
            email = d["email"]
            user, created = User.objects.get_or_create(
                email=email,
                defaults={**d, "email_verified": True},
            )
            if created:
                user.set_password("Dah@2024!")
                user.is_staff = is_staff
                user.is_superuser = is_superuser
                user.save()
                self.stdout.write(f"    + {email} ({d['role']})")
            self.users[d["role"]] = user

        self.users["alice"] = User.objects.get(email="alice@dah.com")
        self.users["bob"] = User.objects.get(email="bob@dah.com")
        self.users["claire"] = User.objects.get(email="claire@dah.com")
        self.users["david"] = User.objects.get(email="david@dah.com")
        self.users["emma"] = User.objects.get(email="emma@dah.com")
        self.users["felix"] = User.objects.get(email="felix@dah.com")

    def _create_events(self):
        self.stdout.write("  → Création des événements...")
        from apps.events.models import Event, EventSpeaker, EventParticipant

        now = timezone.now()
        bureau_user = self.users["president"]

        events_data = [
            dict(
                title="Data Summit Africa 2025",
                description=(
                    "Le grand rendez-vous annuel de la communauté Data Afrique Hub. "
                    "Deux jours d'ateliers, de conférences et de networking pour explorer "
                    "l'avenir de la data science et de l'intelligence artificielle en Afrique. "
                    "Plus de 200 participants attendus de 15 pays."
                ),
                event_type="conference",
                start_date=now + timedelta(days=30),
                end_date=now + timedelta(days=31),
                registration_deadline=now + timedelta(days=25),
                location="Centre de Conférences International, Cotonou, Bénin",
                max_participants=200,
                is_published=True,
                speakers=[
                    dict(name="Dr. Aminata Sow", bio="Data Scientist Senior, Google Africa — 10 ans d'expérience en ML"),
                    dict(name="Ing. Kofi Mensah", bio="CTO @ DataHub Ghana, expert en Data Engineering"),
                    dict(name="Prof. Fatima Zahra", bio="Chercheuse IA, Université Mohammed V, Rabat"),
                ],
            ),
            dict(
                title="Atelier MLOps : De l'expérience à la production",
                description=(
                    "Un atelier pratique intensif sur les bonnes pratiques MLOps. "
                    "Au programme : CI/CD pour modèles ML, monitoring en production, "
                    "Docker/Kubernetes pour ML, et outils open-source (MLflow, DVC, Airflow). "
                    "Prérequis : notions de Python et Machine Learning."
                ),
                event_type="atelier",
                start_date=now + timedelta(days=10),
                end_date=now + timedelta(days=10, hours=6),
                registration_deadline=now + timedelta(days=7),
                location="Campus Numérique Francophone, Lomé, Togo",
                online_link="https://zoom.us/j/dah-mlops-2025",
                max_participants=50,
                is_published=True,
                speakers=[
                    dict(name="Claire Gbénou", bio="MLOps Engineer, experte en déploiement de modèles à l'échelle"),
                ],
            ),
            dict(
                title="Webinaire : L'IA Générative pour les entreprises africaines",
                description=(
                    "Exploration des cas d'usage concrets de l'IA générative (GPT, Claude, Gemini) "
                    "dans le contexte africain. Comment intégrer ces outils dans votre workflow ? "
                    "Quels sont les risques et les opportunités ? Retours d'expérience terrain."
                ),
                event_type="webinaire",
                start_date=now + timedelta(days=5),
                end_date=now + timedelta(days=5, hours=2),
                registration_deadline=now + timedelta(days=4),
                location="",
                online_link="https://meet.google.com/dah-genai-webinar",
                max_participants=None,
                is_published=True,
                speakers=[
                    dict(name="David Ahiable", bio="AI Consultant, spécialiste LLM et IA appliquée"),
                ],
            ),
            dict(
                title="Hackathon Data for Good — Santé Publique",
                description=(
                    "48h pour développer des solutions data au service de la santé publique en Afrique. "
                    "Thème 2025 : Prédiction des épidémies et optimisation de la chaîne de distribution "
                    "médicale. Prix : 3 000 USD pour l'équipe gagnante. Équipes de 3 à 5 personnes."
                ),
                event_type="hackathon",
                start_date=now + timedelta(days=60),
                end_date=now + timedelta(days=62),
                registration_deadline=now + timedelta(days=55),
                location="Hub Tech Abidjan, Côte d'Ivoire",
                max_participants=100,
                is_published=True,
                speakers=[],
            ),
            dict(
                title="Introduction à Python pour l'analyse de données",
                description=(
                    "Formation dédiée aux débutants souhaitant découvrir Python pour l'analyse de données. "
                    "Au programme : bases de Python, Pandas, Matplotlib, Seaborn, et un projet fil rouge "
                    "sur des données réelles africaines. Formation sur 3 semaines, 2h/semaine."
                ),
                event_type="formation",
                start_date=now - timedelta(days=20),
                end_date=now - timedelta(days=1),
                registration_deadline=now - timedelta(days=25),
                location="En ligne (Zoom)",
                max_participants=30,
                is_published=True,
                speakers=[
                    dict(name="Claire Gbénou", bio="Formatrice certifiée, 5 ans d'expérience en Data Science"),
                ],
            ),
            dict(
                title="Meetup DAH — Networking de Janvier",
                description=(
                    "Notre meetup mensuel de networking. Rencontrez les membres de la communauté, "
                    "partagez vos projets, trouvez des collaborateurs. Présentations flash de 5 min "
                    "pour qui veut pitcher son projet ou son parcours."
                ),
                event_type="meetup",
                start_date=now - timedelta(days=45),
                end_date=now - timedelta(days=45, hours=-3),
                registration_deadline=now - timedelta(days=46),
                location="Co-working Space OnePoint, Dakar, Sénégal",
                max_participants=60,
                is_published=True,
                speakers=[],
            ),
        ]

        self.events = []
        for ed in events_data:
            speakers_data = ed.pop("speakers")
            event, created = Event.objects.get_or_create(
                title=ed["title"],
                defaults={**ed, "created_by": bureau_user},
            )
            if created:
                self.stdout.write(f"    + {event.title}")
                for sp in speakers_data:
                    EventSpeaker.objects.create(event=event, **sp)

            self.events.append(event)

        # Inscriptions
        upcoming = [e for e in self.events if e.start_date > now]
        members = [self.users["alice"], self.users["bob"], self.users["claire"], self.users["david"]]
        for event in upcoming[:3]:
            for user in members:
                EventParticipant.objects.get_or_create(
                    event=event, email=user.email,
                    defaults={
                        "user": user,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "nationality": "Bénin",
                        "organisation": "Data Afrique Hub",
                        "profession": "Membre",
                        "motivation": "Inscription de démonstration (seed).",
                    },
                )

    def _create_profiles(self):
        self.stdout.write("  → Création des profils membres...")
        from apps.members.models import MemberProfile, MemberExperience, MemberCertification, SocialLink

        profiles_data = [
            dict(
                user_key="alice",
                bio="Data Scientist passionnée par les problématiques sociales. Je travaille sur des modèles prédictifs pour l'agriculture durable en Afrique de l'Ouest.",
                skills=["Python", "Machine Learning", "TensorFlow", "SQL", "Tableau"],
                github_url="https://github.com/alice-mensah",
                linkedin_url="https://linkedin.com/in/alice-mensah",
                member_number="DAH-2023-001",
                experiences=[
                    dict(title="Data Scientist", company="AfricaAnalytics", start_date=date(2022, 3, 1), is_current=True,
                         description="Développement de modèles ML pour l'optimisation des rendements agricoles."),
                    dict(title="Analyste Données", company="Banque Centrale du Ghana", start_date=date(2020, 1, 1),
                         end_date=date(2022, 2, 28), description="Analyse des flux financiers et reporting réglementaire."),
                ],
                certifications=[
                    dict(title="TensorFlow Developer Certificate", issuer="Google", issued_date=date(2023, 6, 15),
                         credential_url="https://credential.net/alice-tf"),
                    dict(title="AWS Certified Machine Learning Specialty", issuer="Amazon", issued_date=date(2022, 11, 1)),
                ],
                social_links=[
                    dict(platform="twitter", url="https://twitter.com/alice_mensah_ds"),
                ],
            ),
            dict(
                user_key="bob",
                bio="Ingénieur Data spécialisé en architecture cloud et pipelines de données. Contributeur open-source actif.",
                skills=["Apache Spark", "Kafka", "AWS", "dbt", "Airflow", "Python"],
                github_url="https://github.com/robert-ouedraogo",
                linkedin_url="https://linkedin.com/in/robert-ouedraogo",
                member_number="DAH-2023-002",
                experiences=[
                    dict(title="Data Engineer Senior", company="OrangeMoney Africa", start_date=date(2021, 6, 1), is_current=True,
                         description="Architecture des pipelines de données pour 5M+ transactions/jour."),
                ],
                certifications=[
                    dict(title="Google Professional Data Engineer", issuer="Google Cloud", issued_date=date(2023, 3, 20)),
                ],
                social_links=[
                    dict(platform="linkedin", url="https://linkedin.com/in/robert-ouedraogo"),
                ],
            ),
            dict(
                user_key="claire",
                bio="Formatrice et MLOps Engineer. Je démocratise la data science en Afrique francophone à travers des formations accessibles.",
                skills=["MLOps", "Docker", "Kubernetes", "MLflow", "FastAPI", "Python"],
                github_url="https://github.com/claire-gbenou",
                linkedin_url="https://linkedin.com/in/claire-gbenou",
                member_number="DAH-2022-001",
                experiences=[
                    dict(title="MLOps Engineer & Formatrice", company="DataAfrique Academy", start_date=date(2020, 9, 1), is_current=True,
                         description="Formation de +500 data scientists en Afrique. Conception de curricula."),
                    dict(title="ML Engineer", company="Startup HealthTech", start_date=date(2018, 1, 1),
                         end_date=date(2020, 8, 31), description="Développement de modèles de diagnostic médical assisté par IA."),
                ],
                certifications=[
                    dict(title="Certified Kubernetes Administrator (CKA)", issuer="CNCF", issued_date=date(2022, 7, 10)),
                ],
                social_links=[
                    dict(platform="youtube", url="https://youtube.com/@claire-data"),
                ],
            ),
            dict(
                user_key="david",
                bio="AI Consultant et Mentor. J'accompagne les entreprises africaines dans leur transformation data.",
                skills=["LLMs", "Prompt Engineering", "Strategy", "Python", "NLP"],
                linkedin_url="https://linkedin.com/in/david-ahiable",
                website_url="https://davidahiable.com",
                member_number="DAH-2022-002",
                experiences=[
                    dict(title="AI Consultant", company="Indépendant", start_date=date(2019, 1, 1), is_current=True,
                         description="Conseil stratégique en IA pour PME et multinationales africaines."),
                ],
                certifications=[],
                social_links=[
                    dict(platform="twitter", url="https://twitter.com/david_ahiable_ai"),
                ],
            ),
            dict(
                user_key="felix",
                bio="Développeur web reconverti en data engineer junior. Passionné par les pipelines de données et l'écosystème open-source africain.",
                skills=["SQL", "Python", "Pandas", "dbt", "Git", "Docker"],
                github_url="https://github.com/felix-bamba",
                linkedin_url="https://linkedin.com/in/felix-bamba",
                experiences=[
                    dict(title="Data Engineer Junior", company="Freelance", start_date=date(2024, 1, 1), is_current=True,
                         description="Conception de pipelines ETL pour des clients PME en Côte d'Ivoire."),
                    dict(title="Développeur Web Full-Stack", company="AgenceDigital CI", start_date=date(2021, 3, 1),
                         end_date=date(2023, 12, 31), description="Développement d'applications web en React et Node.js."),
                ],
                certifications=[
                    dict(title="dbt Analytics Engineering", issuer="dbt Labs", issued_date=date(2024, 5, 1)),
                ],
                social_links=[],
            ),
            dict(
                user_key="emma",
                bio="Data Analyst en transition professionnelle. Passionnée par la visualisation de données et les insights business.",
                skills=["Python", "Tableau", "Power BI", "SQL", "Excel"],
                linkedin_url="https://linkedin.com/in/emma-toure",
                experiences=[
                    dict(title="Chargée de Reporting", company="Assurances Afrique", start_date=date(2022, 9, 1), is_current=True,
                         description="Tableaux de bord RH et financiers pour la direction générale."),
                ],
                certifications=[
                    dict(title="Google Data Analytics Certificate", issuer="Google / Coursera", issued_date=date(2024, 2, 15)),
                ],
                social_links=[],
            ),
            dict(
                user_key="president",
                bio="Président de Data Afrique Hub. Expert en gouvernance des données et politique d'innovation en Afrique.",
                skills=["Data Governance", "Leadership", "Strategy", "R", "SQL"],
                linkedin_url="https://linkedin.com/in/kouame-assouman",
                member_number="DAH-2021-001",
                experiences=[
                    dict(title="Président", company="Data Afrique Hub", start_date=date(2021, 3, 1), is_current=True,
                         description="Direction stratégique de la communauté panafricaine de data."),
                    dict(title="Directeur Data", company="Ministère de l'Économie Numérique", start_date=date(2018, 1, 1),
                         end_date=date(2021, 2, 28), description="Politique nationale de données ouvertes."),
                ],
                certifications=[
                    dict(title="Executive Education: AI Strategy", issuer="MIT Sloan", issued_date=date(2020, 8, 1)),
                ],
                social_links=[],
            ),
        ]

        for pd in profiles_data:
            user = self.users.get(pd.pop("user_key"))
            if not user:
                continue
            experiences = pd.pop("experiences")
            certifications = pd.pop("certifications")
            social_links = pd.pop("social_links")

            profile, created = MemberProfile.objects.get_or_create(
                user=user,
                defaults=pd,
            )
            if not created:
                for k, v in pd.items():
                    setattr(profile, k, v)
                profile.save()

            for exp in experiences:
                MemberExperience.objects.get_or_create(
                    member=profile, title=exp["title"], company=exp["company"],
                    defaults=exp,
                )
            for cert in certifications:
                MemberCertification.objects.get_or_create(
                    member=profile, title=cert["title"], issuer=cert["issuer"],
                    defaults=cert,
                )
            for sl in social_links:
                SocialLink.objects.get_or_create(
                    member=profile, platform=sl["platform"],
                    defaults=sl,
                )
            self.stdout.write(f"    + Profil: {user.full_name}")

    def _create_memberships(self):
        self.stdout.write("  → Création des candidatures...")
        from apps.memberships.models import Candidature

        bureau_user = self.users["president"]
        now = timezone.now()

        apps_data = [
            dict(
                user_key="emma",
                country="Sénégal",
                profession="Data Analyst",
                motivation="Passionnée de data science depuis 3 ans, j'ai suivi plusieurs formations en ligne (Coursera, DataCamp). "
                           "Je souhaite rejoindre DAH pour bénéficier d'un mentorat structuré, contribuer à des projets communautaires "
                           "et accélérer ma transition professionnelle vers un poste de Data Analyst.",
                status="pending",
            ),
            dict(
                user_key="felix",
                country="Côte d'Ivoire",
                profession="Data Engineer Junior",
                motivation="Développeur web de formation reconverti en data engineer junior. "
                           "Je maîtrise SQL, Python et Pandas. Rejoindre DAH me permettrait de collaborer avec des experts, "
                           "de monter en compétence sur les outils cloud et de contribuer à l'écosystème data africain.",
                status="accepted",
            ),
        ]

        for ad in apps_data:
            user = self.users.get(ad["user_key"])
            if not user:
                continue
            is_reviewed = ad["status"] != "pending"
            candidature, created = Candidature.objects.get_or_create(
                email=user.email,
                defaults={
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "country": ad["country"],
                    "profession": ad["profession"],
                    "motivation": ad["motivation"],
                    "status": ad["status"],
                    "user": user,
                    "reviewed_by": bureau_user if is_reviewed else None,
                    "reviewed_at": now if is_reviewed else None,
                },
            )
            if created:
                self.stdout.write(f"    + Candidature: {user.full_name} ({ad['status']})")

    def _create_departments(self):
        """Crée directement via l'ORM (pas via les services applicatifs) pour ne
        déclencher aucun email — sauf la série de séances récurrentes, générée via
        le vrai flux (create_session) car cette fonction n'envoie elle-même aucun
        email (seul le rappel explicite en envoie un)."""
        self.stdout.write("  → Création des départements...")
        from apps.accounts.models import ROLES
        from apps.departments.models import (
            Department, DepartmentMembership, DepartmentAnnouncement, DepartmentSession, DepartmentTask,
        )
        from apps.departments.services import create_session as generate_session_series

        today = timezone.now().date()

        departments_data = [
            dict(
                name="Data Engineering",
                description="Pipelines de données, infrastructure et outillage data pour toute la communauté.",
                lead_key="bob", co_lead_key="felix",
                members=[
                    dict(user_key="bob", start_date=today - timedelta(days=400)),
                    dict(user_key="felix", start_date=today - timedelta(days=200)),
                ],
                announcements=[
                    dict(title="Bienvenue dans le département !",
                         content="Ravi de vous compter parmi nous. Feuille de route du trimestre : migration vers dbt, "
                                 "standup hebdomadaire le mardi."),
                ],
                sessions=[
                    dict(date=today - timedelta(days=14), theme="Revue d'architecture pipelines",
                         report="Discussion sur la migration vers dbt. Décision : POC sur le pipeline de facturation "
                                "d'ici 3 semaines.",
                         present_keys=["bob", "felix"]),
                ],
                series=dict(
                    first_date=today + timedelta(days=2), theme="Standup hebdomadaire",
                    meet_link="https://meet.google.com/deng-standup", frequency="weekly", occurrences=4,
                ),
                tasks=[
                    dict(title="Documenter le pipeline de facturation", assigned_key="felix",
                         due_date=today + timedelta(days=10), status="in_progress"),
                    dict(title="Mettre en place les tests dbt", assigned_key="bob",
                         due_date=today + timedelta(days=20), status="todo"),
                ],
            ),
            dict(
                name="Machine Learning & MLOps",
                description="Recherche appliquée, mise en production de modèles et bonnes pratiques MLOps.",
                lead_key="claire", co_lead_key="alice",
                members=[
                    dict(user_key="claire", start_date=today - timedelta(days=500)),
                    dict(user_key="alice", start_date=today - timedelta(days=45)),
                ],
                announcements=[
                    dict(title="Nouveau : gabarit de déploiement MLflow",
                         content="Un gabarit de déploiement standardisé est disponible pour tous les projets ML du hub. "
                                 "Documentation dans le drive partagé."),
                    dict(title="Recherche de volontaires : atelier feature store",
                         content="Nous cherchons 2-3 volontaires pour co-animer un atelier sur les feature stores "
                                 "le mois prochain."),
                ],
                sessions=[
                    dict(date=today - timedelta(days=7), theme="Feature store : panorama des outils",
                         report="Comparatif Feast / Tecton / Hopsworks. Feast retenu pour le POC interne.",
                         present_keys=["claire", "alice"]),
                    dict(date=today + timedelta(days=3), theme="Point d'avancement POC Feast",
                         meet_link="https://meet.google.com/mlops-poc"),
                ],
                tasks=[
                    dict(title="POC Feast sur les données évènements", assigned_key="alice",
                         due_date=today + timedelta(days=15), status="in_progress"),
                    dict(title="Rédiger le guide de contribution MLOps", assigned_key="claire", status="todo"),
                    dict(title="Auditer les modèles en production", assigned_key="claire", status="done"),
                ],
            ),
            dict(
                name="Formation & Mentorat",
                description="Programmes de formation, mentorat des nouveaux membres et certifications communautaires.",
                lead_key="david", co_lead_key=None,
                members=[
                    dict(user_key="david", start_date=today - timedelta(days=300)),
                    dict(user_key="emma", start_date=today - timedelta(days=30)),
                ],
                announcements=[
                    dict(title="Programme de mentorat — appel à mentors",
                         content="Nous recherchons des mentors pour accompagner les nouveaux membres acceptés ce "
                                 "trimestre. Contactez David si intéressé."),
                ],
                sessions=[
                    dict(date=today - timedelta(days=21), theme="Kickoff programme de mentorat",
                         report="8 binômes mentor/mentoré constitués. Premier point d'étape prévu dans un mois.",
                         present_keys=["david", "emma"]),
                ],
                tasks=[
                    dict(title="Préparer le support d'onboarding mentorat", assigned_key="emma",
                         due_date=today + timedelta(days=5), status="blocked"),
                ],
            ),
        ]

        for dd in departments_data:
            lead = self.users.get(dd["lead_key"])
            co_lead = self.users.get(dd["co_lead_key"]) if dd.get("co_lead_key") else None

            department, created = Department.objects.get_or_create(
                name=dd["name"],
                defaults={"description": dd["description"], "lead": lead, "co_lead": co_lead},
            )
            if created:
                self.stdout.write(f"    + Département : {department.name}")
                for user in filter(None, [lead, co_lead]):
                    if user.role != ROLES.RESPONSABLE_DEPARTEMENT:
                        user.role = ROLES.RESPONSABLE_DEPARTEMENT
                        user.save(update_fields=["role"])

            for md in dd.get("members", []):
                user = self.users.get(md["user_key"])
                if not user:
                    continue
                DepartmentMembership.objects.get_or_create(
                    department=department, user=user, start_date=md["start_date"],
                    defaults={"end_date": md.get("end_date")},
                )

            for ad in dd.get("announcements", []):
                DepartmentAnnouncement.objects.get_or_create(
                    department=department, title=ad["title"],
                    defaults={"content": ad["content"], "author": lead},
                )

            for sd in dd.get("sessions", []):
                present_keys = sd.pop("present_keys", [])
                session, s_created = DepartmentSession.objects.get_or_create(
                    department=department, date=sd["date"], theme=sd.get("theme", ""),
                    defaults={
                        "report": sd.get("report", ""),
                        "meet_link": sd.get("meet_link", ""),
                        "created_by": lead,
                    },
                )
                if s_created and present_keys:
                    session.present_members.set([self.users[k] for k in present_keys if k in self.users])

            series = dd.get("series")
            if series and not DepartmentSession.objects.filter(
                department=department, date=series["first_date"], theme=series["theme"],
            ).exists():
                generate_session_series(
                    department, lead, date=series["first_date"], theme=series["theme"],
                    meet_link=series.get("meet_link", ""), frequency=series["frequency"],
                    occurrences=series["occurrences"],
                )

            for td in dd.get("tasks", []):
                title = td.pop("title")
                assigned = self.users.get(td.pop("assigned_key", None))
                DepartmentTask.objects.get_or_create(
                    department=department, title=title,
                    defaults={**td, "assigned_to": assigned, "created_by": lead},
                )

        # Historique : Alice était dans Data Engineering avant de rejoindre Machine Learning,
        # pour illustrer l'historique d'adhésion sur un profil.
        data_eng = Department.objects.filter(name="Data Engineering").first()
        if data_eng and "alice" in self.users:
            DepartmentMembership.objects.get_or_create(
                department=data_eng, user=self.users["alice"],
                start_date=today - timedelta(days=400),
                defaults={"end_date": today - timedelta(days=45)},
            )
